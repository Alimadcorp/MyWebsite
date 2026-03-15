using System.Globalization;

namespace LogWays;

public sealed class AppSettings
{
    public bool Live { get; init; } = true;
    public string WsUri { get; init; } = "wss://ws.alimad.co/socket";
    public int FlushIntervalMs { get; init; } = 30_000;

    private static readonly string BaseDir =
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LogWays");

    private static readonly string SettingsPath = Path.Combine(BaseDir, "settings.txt");

    public static AppSettings LoadOrCreateDefault()
    {
        try
        {
            Directory.CreateDirectory(BaseDir);

            if (!File.Exists(SettingsPath))
            {
                var def = new AppSettings();
                Write(def);
                return def;
            }

            var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var line in File.ReadAllLines(SettingsPath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
                var idx = trimmed.IndexOf('=');
                if (idx <= 0) continue;
                var key = trimmed[..idx].Trim();
                var value = trimmed[(idx + 1)..].Trim();
                dict[key] = value;
            }

            bool live = ParseBool(dict, "LIVE", true);
            string ws = dict.TryGetValue("WS_URI", out var u) && !string.IsNullOrWhiteSpace(u)
                ? u
                : "wss://ws.alimad.co/socket";
            int flushMs = ParseInt(dict, "FLUSH_INTERVAL_MS", 30_000);

            var settings = new AppSettings
            {
                Live = live,
                WsUri = ws,
                FlushIntervalMs = flushMs
            };

            return settings;
        }
        catch
        {
            var fallback = new AppSettings();
            try { Write(fallback); } catch { }
            return fallback;
        }
    }

    private static bool ParseBool(Dictionary<string, string> dict, string key, bool defaultValue)
    {
        if (dict.TryGetValue(key, out var v) &&
            bool.TryParse(v, out var b))
        {
            return b;
        }
        return defaultValue;
    }

    private static int ParseInt(Dictionary<string, string> dict, string key, int def)
    {
        if (dict.TryGetValue(key, out var v) &&
            int.TryParse(v, NumberStyles.Integer, CultureInfo.InvariantCulture, out var n) &&
            n > 0)
        {
            return n;
        }
        return def;
    }

    private static void Write(AppSettings s)
    {
        var lines = new[]
        {
            "# LogWays settings",
            "# LIVE: enable or disable WebSocket connection",
            $"LIVE={s.Live.ToString().ToLowerInvariant()}",
            "",
            "# WS_URI: WebSocket server URI",
            $"WS_URI={s.WsUri}",
            "",
            "# FLUSH_INTERVAL_MS: how often to flush session log to disk",
            $"FLUSH_INTERVAL_MS={s.FlushIntervalMs}"
        };
        File.WriteAllLines(SettingsPath, lines);
    }
}

