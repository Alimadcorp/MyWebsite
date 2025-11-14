export async function GET(req) {
  const r = await fetch(
    "https://log.alimad.co/api/pull?channel=plzgiveideasss"
  );
  const data = await r.json();
  let c = data.logs.length;
  return new Response(c, {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
