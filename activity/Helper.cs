using System.Runtime.InteropServices;
using System.Text;

public static class TaskbarApps
{
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")] 
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")] 
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")] 
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxLen);

    [DllImport("user32.dll")]
    private static extern uint GetWindowLong(IntPtr hWnd, int nIndex);

    const int GWL_EXSTYLE = -20;
    const uint WS_EX_TOOLWINDOW = 0x00000080;

    public static int CountTaskbarWindows()
    {
        int count = 0;

        EnumWindows((hWnd, l) =>
        {
            if (!IsWindowVisible(hWnd)) return true;
            uint style = GetWindowLong(hWnd, GWL_EXSTYLE);
            if ((style & WS_EX_TOOLWINDOW) != 0) return true;
            var title = new StringBuilder(256);
            GetWindowText(hWnd, title, 256);
            if (title.Length == 0) return true;
            count++;
            return true;
        }, IntPtr.Zero);
        return count;
    }
}
