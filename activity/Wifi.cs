using System.Diagnostics;

namespace LogWays;

public static class WifiHelper
{
    public static string GetWifiName()
    {
        try
        {
            using var p = new Process();
            p.StartInfo.FileName = "netsh";
            p.StartInfo.Arguments = "wlan show interfaces";
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.CreateNoWindow = true;
            p.Start();

            string output = p.StandardOutput.ReadToEnd().ToLower();
            p.WaitForExit();

            foreach (var line in output.Split('\n'))
            {
                if (line.Trim().StartsWith("ssid"))
                {
                    var parts = line.Split(':');
                    if (parts.Length > 1)
                    {
                        string ssid = parts[1].Trim();
                        if (ssid.Length > 0 && ssid != "ssid")
                            return ssid;
                    }
                }
            }
        }
        catch {}

        return "";
    }
}
