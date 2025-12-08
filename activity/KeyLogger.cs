using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

public static class KeyCounter
{
    private static int _count = 0;
    private static readonly HashSet<int> _held = new();

    public static int ResetCount()
    {
        int x = _count;
        _count = 0;
        return x;
    }

    public static void Start()
    {
        Thread t = new Thread(() =>
        {
            while (true)
            {
                for (int vk = 0x08; vk <= 0xFF; vk++)
                {
                    bool down = GetAsyncKeyState(vk) < 0;

                    if (down)
                    {
                        if (!_held.Contains(vk))
                        {
                            _held.Add(vk);
                            Interlocked.Increment(ref _count);
                        }
                    }
                    else
                    {
                        _held.Remove(vk);
                    }
                }

                Thread.Sleep(5);
            }
        })
        { IsBackground = true };

        t.Start();
    }

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);
}
