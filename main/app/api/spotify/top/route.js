import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=AnonIdiotGuy&api_key=aa2cbd69f4ee8bb22996b3e8503079f1&format=json&limit=10`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const tracks = data.toptracks.track.map(t => ({
      title: t.name,
      artist: t.artist.name,
      cover: t.image?.[2]["#text"],
      url: t.url
    }));

    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}
