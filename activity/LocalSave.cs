using System.IO;
using System.Text.Json;

public static class SessionLogger
{
    private static readonly object _lock = new();
    private static string _sessionFile = "";
    private static List<Dictionary<string, object>> _entries = new();

    public static void StartSession()
    {
        string baseDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LogWays");
        string yearDir = Path.Combine(baseDir, DateTime.Now.Year.ToString());
        string monthDir = Path.Combine(yearDir, DateTime.Now.ToString("MMM"));

        Directory.CreateDirectory(monthDir);

        long ticks = DateTime.UtcNow.Ticks;
        _sessionFile = Path.Combine(monthDir, $"{ticks}.json");

        lock (_lock)
        {
            _entries.Clear();
        }
    }

    public static void LogSample(Dictionary<string, object> sample)
    {
        lock (_lock)
        {
            _entries.Add(sample);
        }
    }

    public static void LogKeys(string keys)
    {
        lock (_lock)
        {
            _entries.Add(new Dictionary<string, object>
            {
                ["time"] = DateTime.UtcNow,
                ["keys"] = keys
            });
        }
    }

    public static void LogWebSocketMessage(string type, object data)
    {
        lock (_lock)
        {
            _entries.Add(new Dictionary<string, object>
            {
                ["time"] = DateTime.UtcNow,
                ["type"] = type,
                ["data"] = data
            });
        }
    }

    public static void LogScreenshot(string url)
    {
        lock (_lock)
        {
            _entries.Add(new Dictionary<string, object>
            {
                ["time"] = DateTime.UtcNow,
                ["screenshot"] = url
            });
        }
    }

    public static void Flush()
    {
        lock (_lock)
        {
            if (string.IsNullOrEmpty(_sessionFile)) return;

            var json = JsonSerializer.Serialize(_entries, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_sessionFile, json);
        }
    }
}
