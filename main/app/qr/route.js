import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const data = params.values().next().value;

    if (!data) return new NextResponse("Missing data", { status: 400 });

    const decodedText = decodeURIComponent(data);

    const qrCodeBuffer = await QRCode.toBuffer(decodedText, {
      type: "png",
      width: 512,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    return new NextResponse(qrCodeBuffer, {
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
