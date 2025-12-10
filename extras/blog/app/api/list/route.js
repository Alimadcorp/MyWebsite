// app/api/list/route.js
export async function GET() {
  const url = "https://cdn.alimad.co/f/Personal/blog/";

  const res = await fetch(url, {
    method: "PROPFIND",
    headers: {
      Depth: "1"
    }
  });

  if (!res.ok) {
    return new Response(`<error>Failed to fetch from ${url}</error>`, {
      status: res.status,
      headers: { "Content-Type": "application/xml" }
    });
  }

  const xml = await res.text();

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" }
  });
}
