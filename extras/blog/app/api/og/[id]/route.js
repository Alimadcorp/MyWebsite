import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req, { params }) {
  const { id } = await params;
  const blogTitle = decodeURIComponent(id || "");

  const { searchParams } = new URL(req.url);
  const rawDate = searchParams.get("date");

  let formattedDate = null;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d)) {
      let parts = d
        .toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .split(" ");
      formattedDate = `${parts[0]} ${parts[1]} ${parts[2]}, ${parts[3]}`;
    }
  }

  const regular = await fetch(
    new URL("./fonts/Geist-Regular.ttf", import.meta.url)
  ).then((r) => r.arrayBuffer());
  const bold = await fetch(
    new URL("./fonts/Geist-Bold.ttf", import.meta.url)
  ).then((r) => r.arrayBuffer());

  const fonts = [
    ...(regular
      ? [{ name: "Geist Sans", data: regular, style: "normal", weight: 400 }]
      : []),
    ...(bold
      ? [{ name: "Geist Sans", data: bold, style: "normal", weight: 700 }]
      : []),
  ];

  let size = 96;
  if (blogTitle.length > 30) size = 80;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          backgroundImage: "linear-gradient(135deg, #002 0%, #246 100%)",
          color: "#fff",
          padding: "60px",
          border: "10px solid #fff",
          borderRadius: "20px",
          boxSizing: "border-box",
          fontFamily:
            "Geist Sans, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 700,
            wordBreak: "break-word",
            maxWidth: "100%",
            lineHeight: 1.02,
          }}
        >
          {blogTitle}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src="https://cdn.alimad.co/f/Personal/blog/static/favicon.png"
            width="65"
            height="65"
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              marginLeft: 10,
              display: "flex",
            }}
          >
            A blog by Alimad Co
            {formattedDate ? " • " : ""}
          </div>
          {formattedDate && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 300,
                maxWidth: "100%",
                color: "#aaa",
              }}
            >
              {formattedDate}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
