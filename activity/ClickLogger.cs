using System.Runtime.InteropServices;

public static class MouseCounter
{
    private static int _clicks = 0;

    public static int ResetClicks()
    {
        int x = _clicks;
        _clicks = 0;
        return x;
    }

    public static void Start()
    {
        Thread t = new(() =>
        {
            while (true)
            {
                for (int button = 0; button < 5; button++)
                {
                    bool down = GetAsyncKeyState(0x01 + button * 0x01) < 0; 
                    if (down)
                    {
                        if (!_held.Contains(button))
                        {
                            _held.Add(button);
                            Interlocked.Increment(ref _clicks);
                            KeyLogger.CLICKED();
                        }
                    }
                    else
                    {
                        _held.Remove(button);
                    }
                }
                Thread.Sleep(5);
            }
        })
        { IsBackground = true };
        t.Start();
    }

    private static readonly HashSet<int> _held = new();

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);
}
