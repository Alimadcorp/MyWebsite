export async function GET() {
  const KVDB_BUCKET = process.env.KVDB_BUCKET;

  async function set(key, value) {
    if (value === undefined || value === null) value = "";
    const res = await fetch(
      `${KVDB_BUCKET}/${encodeURIComponent(key)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: String(value),
      }
    );
    if (!res.ok) throw new Error(`KVDB write fail: ${await res.text()}`);
    return true;
  }

  async function get(key) {
    const res = await fetch(
      `${KVDB_BUCKET}/${encodeURIComponent(key)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`KVDB read fail: ${await res.text()}`);
    return await res.text();
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  let accessToken = await get("spotify_access_token");
  let expiresAt = parseInt((await get("spotify_access_expires")) || "0");

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

    console.log(tokenRes.status);

    if (!tokenRes.ok)
      return new Response("token refresh fail", { status: 500 });

    const j = await tokenRes.json();
    accessToken = j.access_token;
    if (j.refresh_token) refreshToken = j.refresh_token;
    const expiresIn = j.expires_in * 1000;
    expiresAt = now + expiresIn;

    await set("spotify_access_token", accessToken);
    await set("spotify_access_expires", String(expiresAt));
  }

  const r = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (r.status === 204)
    return new Response(JSON.stringify({ playing: false }), {
      headers: { "Content-Type": "application/json" },
    });
  if (!r.ok)
    return new Response(JSON.stringify({ error: "fail" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  const data = await r.json();
  const i = data.item;
  const progress = data.progress_ms;
  const duration = i.duration_ms;

  return new Response(
    JSON.stringify({
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
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
