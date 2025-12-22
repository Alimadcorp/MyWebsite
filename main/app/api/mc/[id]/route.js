import { NextResponse } from "next/server";

const MOJANG = "https://api.mojang.com/users/profiles/minecraft/";
const SESSION = "https://sessionserver.mojang.com/session/minecraft/profile/";

const toHttps = (v) => {
  if (typeof v === "string") return v.replace(/^http:\/\//, "https://");
  if (Array.isArray(v)) return v.map(toHttps);
  if (v && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, toHttps(val)]));
  return v;
};

export async function GET(_, { params }) {
  const { id } = params;

  try {
    const p = await fetch(MOJANG + id, { cache: "force-cache" });
    if (!p.ok) {
      if (p.status === 404) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Mojang API error" }, { status: p.status });
    }

    const profile = await p.json();

    const s = await fetch(SESSION + profile.id, { cache: "force-cache" });
    if (!s.ok) {
      return NextResponse.json({ error: "Session server error" }, { status: s.status });
    }
    const session = await s.json();

    const texturesProp = session.properties?.find(p => p.name === "textures");
    if (!texturesProp)
      return NextResponse.json({ id: session.id, name: session.name });

    let decoded = JSON.parse(
      Buffer.from(texturesProp.value, "base64").toString("utf8")
    );

    delete decoded.profileId;
    if (decoded.profileName === session.name) delete decoded.profileName;

    decoded = toHttps(decoded);

    return NextResponse.json({
      id: session.id,
      name: session.name,
      textures: decoded
    });
  } catch (error) {
    console.error("MC API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
