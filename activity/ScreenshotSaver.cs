using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;

public static class ScreenshotSaver
{
    private static readonly string baseDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "LogWays", DateTime.Now.Year.ToString(), "Screenshots");

    static ScreenshotSaver()
    {
        Directory.CreateDirectory(baseDir);
    }

    public static string SaveScreenshot(string url, byte[] imageBytes, DateTime timestamp)
    {
        var match = Regex.Match(url, @"ibb\.co/([^/]+)/([^/.]+)\.png");
        string fileName = match.Success ? $"{match.Groups[1].Value}.{match.Groups[2].Value}.jpg" : $"{Guid.NewGuid()}.jpg";

        string filePath = Path.Combine(baseDir, fileName);

        using var ms = new MemoryStream(imageBytes);
        using var bmp = new Bitmap(ms);
        using var jpegMs = new MemoryStream();
        var encoder = GetEncoder(ImageFormat.Jpeg);
        var encoderParams = new EncoderParameters(1);
        encoderParams.Param[0] = new EncoderParameter(Encoder.Quality, 95L);
        bmp.Save(jpegMs, encoder, encoderParams);

        using var jpegBmp = new Bitmap(jpegMs);
        try
        {
            var dtProp = CreatePropertyItem(0x0132, timestamp);
            jpegBmp.SetPropertyItem(dtProp);

            var urlProp = CreatePropertyItem(0x010E, url);
            jpegBmp.SetPropertyItem(urlProp);
        }
        catch
        {
        }

        jpegBmp.Save(filePath, ImageFormat.Jpeg);
        return filePath;
    }

    private static PropertyItem CreatePropertyItem(int id, object value)
    {
        using var tmp = new Bitmap(1, 1);
        PropertyItem prop = tmp.PropertyItems[0];
        prop.Id = id;
        prop.Type = 2; // ASCII
        string str = value is DateTime dt ? dt.ToString("yyyy:MM:dd HH:mm:ss") : value.ToString();
        prop.Value = System.Text.Encoding.ASCII.GetBytes(str + '\0');
        prop.Len = prop.Value.Length;
        return prop;
    }

    private static ImageCodecInfo GetEncoder(ImageFormat format)
    {
        return ImageCodecInfo.GetImageDecoders().First(c => c.FormatID == format.Guid);
    }
}
