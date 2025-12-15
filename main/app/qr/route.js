import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const p = url.searchParams;

    const data = p.get("data");
    if (!data) return new NextResponse("Missing data", { status: 400 });

    const format = (p.get("format") || "png").toLowerCase();
    const size = Number(p.get("size") || 512);
    const margin = Number(p.get("margin") || 2);
    const ec = (p.get("ec") || "M");
    const dark = p.get("dark") || "#000000";
    const light = p.get("light") || "#ffffff";
    const transparent = p.get("transparent") === "1";
    const scale = Number(p.get("scale") || 4);

    const options = {
      errorCorrectionLevel: ec,
      margin,
      scale,
      width: size,
      color: {
        dark,
        light: transparent ? "#00000000" : light,
      },
    };

    if (format === "svg") {
      const svg = await QRCode.toString(decodeURIComponent(data), {
        ...options,
        type: "svg",
      });

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const buffer = await QRCode.toBuffer(decodeURIComponent(data), {
      ...options,
      type: "png",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error generating QR code", { status: 500 });
  }
}
