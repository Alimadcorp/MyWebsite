import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=AnonIdiotGuy&api_key=aa2cbd69f4ee8bb22996b3e8503079f1&format=json&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const track = data.recenttracks.track[0];
    const playing = track["@attr"]?.nowplaying === "true";

    return NextResponse.json({
      playing,
      title: track.name,
      artist: track.artist["#text"],
      album: track.album["#text"],
      cover: track.image?.[3]["#text"],
      url: track.url
    });
  } catch (e) {
    return NextResponse.json({ error: "Last.fm broke" }, { status: 500 });
  }
}
