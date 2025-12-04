import { get } from "@vercel/edge-config";

export async function GET() {
  async function set(key, value) {
    console.log("Setting edge config:", key, value);
    const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const TEAM_ID = process.env.TEAM_ID;

    const url = TEAM_ID
      ? `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items?teamId=${TEAM_ID}`
      : `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            operation: "upsert",
            key,
            value,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`EdgeConfig write fail: ${err}`);
    }
    return true;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  let refreshToken = await get("spotify_refresh_token");
  let accessToken = await get("spotify_access_token");
  let expiresAt = await get("spotify_access_expires");

  const now = Date.now();

  if (!accessToken || now >= expiresAt) {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!tokenRes.ok)
      return new Response("token refresh fail", { status: 500 });

    const j = await tokenRes.json();
    accessToken = j.access_token;
    if (j.refresh_token) refreshToken = j.refresh_token;
    const expiresIn = j.expires_in * 1000;
    expiresAt = now + expiresIn;

    await set("spotify_access_token", accessToken);
    await set("spotify_access_expires", expiresAt);
    if (j.refresh_token) await set("spotify_refresh_token", refreshToken);
  }

  const r = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (r.status === 204) return Response.json({ playing: false });

  if (!r.ok) return Response.json({ error: "fail" }, { status: 500 });

  const data = await r.json();
  const i = data.item;
  const progress = data.progress_ms;
  const duration = i.duration_ms;

  return Response.json({
    playing: data.is_playing,
    title: i.name,
    album: i.album.name,
    artist: i.artists.map((a) => a.name).join(", "),
    cover: i.album.images?.[0]?.url,
    url: i.external_urls.spotify,
    embed: `https://open.spotify.com/embed/track/${i.id}`,
    progressMs: progress,
    durationMs: duration,
    percentage: duration ? (progress / duration) * 100 : 0,
    startedAt: data.timestamp - progress,
    device: data.device
      ? {
          name: data.device.name,
          type: data.device.type,
          volume: data.device.volume_percent,
        }
      : null,
  });
}
