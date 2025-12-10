public static class BatteryMonitor
{
    public static int GetBatteryPercent()
    {
        return (int)(SystemInformation.PowerStatus.BatteryLifePercent * 100);
    }

    public static bool IsPluggedIn()
    {
        return SystemInformation.PowerStatus.PowerLineStatus == PowerLineStatus.Online;
    }
}
