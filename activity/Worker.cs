using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace LogWays;

public class Worker : BackgroundService
{
    const string WS_URI = "wss://ws.alimad.co/socket";
    const string WS_PASSWORD = "Password here :3";
    const string API_POST_URL = "https://activity.alimad.co/endpoint";
    const double TOTAL_RAM = 8L * 1024 * 1024 * 1024;
    const int CPU_CORES = 8;

    readonly HttpClient http = new();
    readonly Dictionary<int, double> lastCpu = new();
    readonly Dictionary<int, DateTime> lastTime = new();
    readonly string deviceName = Environment.MachineName;

    ClientWebSocket ws = null!;
    CancellationTokenSource wsCts = new();

    [DllImport("user32.dll")]
    static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);

    [DllImport("kernel32.dll")]
    static extern uint GetTickCount();

    public Worker()
    {
        Task.Run(() => WsConnectLoopAsync(wsCts.Token));
    }

    protected override async Task ExecuteAsync(CancellationToken token)
    {
        var minuteBuffer = new List<Dictionary<string, object>>(capacity: 60);
        var sampleInterval = TimeSpan.FromSeconds(1);

        while (!token.IsCancellationRequested)
        {
            var sample = new Dictionary<string, object>();

            try
            {
                var hwnd = GetForegroundWindow();
                if (hwnd != IntPtr.Zero)
                {
                    GetWindowThreadProcessId(hwnd, out uint pid);
                    var p = Process.GetProcessById((int)pid);

                    string name = CsvSafe(p.ProcessName);
                    string title = CsvSafe(p.MainWindowTitle);

                    long ramBytes = p.WorkingSet64;
                    double ramPercent = (ramBytes / TOTAL_RAM) * 100.0;

                    double nowCpu = p.TotalProcessorTime.TotalMilliseconds;
                    DateTime nowTime = DateTime.UtcNow;
                    double cpuPercent = 0.0;

                    if (lastCpu.TryGetValue(p.Id, out double prevCpu) &&
                        lastTime.TryGetValue(p.Id, out DateTime prevTime))
                    {
                        double cpuDelta = nowCpu - prevCpu;
                        double timeDelta = (nowTime - prevTime).TotalMilliseconds;
                        if (timeDelta > 0) cpuPercent = (cpuDelta / timeDelta) * 100.0 / CPU_CORES;
                    }

                    lastCpu[p.Id] = nowCpu;
                    lastTime[p.Id] = nowTime;

                    sample["device"] = deviceName;
                    sample["app"] = name;
                    sample["title"] = title;
                    sample["ramPercent"] = Math.Round(ramPercent, 2);
                    sample["cpuPercent"] = Math.Round(cpuPercent, 2);
                    try { sample["wifi"] = WifiHelper.GetWifiName(); } catch { sample["wifi"] = ""; }
                    sample["isIdle"] = IsIdle();
                    sample["isSleeping"] = hwnd == IntPtr.Zero;
                }
                else
                {
                    sample["device"] = deviceName;
                    sample["app"] = "";
                    sample["isIdle"] = true;
                    sample["isSleeping"] = true;
                }

                sample["ip"] = GetLocalIPAddress();
            }
            catch (Exception ex)
            {
                sample["error"] = ex.Message;
            }
            _ = SendWebSocketSampleAsync(sample);
            minuteBuffer.Add(sample);
            if (minuteBuffer.Count >= 60)
            {
                var aggregate = AggregateMinute(minuteBuffer);
                minuteBuffer.Clear();
                _ = PostAggregateAsync(aggregate);
            }

            await Task.Delay(sampleInterval, token);
        }
    }

    static Dictionary<string, object> AggregateMinute(List<Dictionary<string, object>> bucket)
    {
        double sumCpu = 0;
        double sumRam = 0;
        int cpuCount = 0;
        int ramCount = 0;
        var appCounts = new Dictionary<string,int>(StringComparer.OrdinalIgnoreCase);
        string wifi = "";

        foreach (var s in bucket)
        {
            if (s.TryGetValue("cpuPercent", out var c) && c is double cd) { sumCpu += cd; cpuCount++; }
            if (s.TryGetValue("ramPercent", out var r) && r is double rd) { sumRam += rd; ramCount++; }
            if (s.TryGetValue("app", out var a) && a is string app && !string.IsNullOrEmpty(app)) { appCounts.TryGetValue(app, out int v); appCounts[app] = v + 1; }
            if (string.IsNullOrEmpty(wifi) && s.TryGetValue("wifi", out var w) && w is string ws && !string.IsNullOrEmpty(ws)) wifi = ws;
        }

        string dominantApp = "";
        int domMax = 0;
        foreach (var kv in appCounts) if (kv.Value > domMax) { domMax = kv.Value; dominantApp = kv.Key; }

        return new Dictionary<string, object>
        {
            ["device"] = Environment.MachineName,
            ["samples"] = bucket.Count,
            ["avgCpuPercent"] = cpuCount > 0 ? Math.Round(sumCpu / cpuCount, 2) : 0,
            ["avgRamPercent"] = ramCount > 0 ? Math.Round(sumRam / ramCount, 2) : 0,
            ["dominantApp"] = dominantApp,
            ["wifi"] = wifi,
        };
    }

    static string GetLocalIPAddress()
    {
        try
        {
            foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
            {
                if (ni.OperationalStatus != OperationalStatus.Up) continue;
                foreach (var ua in ni.GetIPProperties().UnicastAddresses)
                {
                    if (ua.Address.AddressFamily == AddressFamily.InterNetwork)
                        return ua.Address.ToString();
                }
            }
        }
        catch { }
        return "0.0.0.0";
    }

    static bool IsIdle()
    {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));
        if (GetLastInputInfo(ref lii))
        {
            uint idleTime = (uint)Environment.TickCount - lii.dwTime;
            return idleTime > 60_000;
        }
        return false;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct LASTINPUTINFO
    {
        public uint cbSize;
        public uint dwTime;
    }

    [DllImport("user32.dll")]
    static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

    async Task PostAggregateAsync(Dictionary<string, object> aggregate)
    {
        try
        {
            var json = JsonSerializer.Serialize(aggregate);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            var res = await http.PostAsync(API_POST_URL, content);
        }
        catch { }
    }

    async Task SendWebSocketSampleAsync(Dictionary<string, object> sample)
    {
        try
        {
            if (ws == null || ws.State != WebSocketState.Open) return;
            var payload = JsonSerializer.Serialize(new { type = "sample", data = sample });
            var bytes = Encoding.UTF8.GetBytes(payload);
            await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        catch { }
    }

    async Task WsConnectLoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                ws = new ClientWebSocket();
                var uri = new Uri(WS_URI);
                await ws.ConnectAsync(uri, ct);

                var authMsg = JsonSerializer.Serialize(new { type = "auth", password = WS_PASSWORD, device = deviceName });
                var bytes = Encoding.UTF8.GetBytes(authMsg);
                await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, ct);

                var buffer = new byte[4096];
                while (ws.State == WebSocketState.Open && !ct.IsCancellationRequested)
                {
                    var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), ct);
                    if (result.MessageType == WebSocketMessageType.Close) break;
                }
            }
            catch { }
            finally { try { ws?.Abort(); ws?.Dispose(); } catch { } }
            await Task.Delay(2000, ct);
        }
    }

    static string CsvSafe(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        s = s.Replace("\"", "\"\"");
        if (s.Contains(',') || s.Contains('"') || s.Contains('\n'))
            return $"\"{s}\"";
        return s;
    }
}
