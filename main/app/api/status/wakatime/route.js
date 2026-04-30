import * as cheerio from "cheerio";

function parseActivity(html) {
  const parsed = cheerio.load(html);
  const days = [];

  const script = parsed("script[type='application/json']").html();
  if (!script) return null;

  const data = JSON.parse(script);
  if (!data) return null;
  const activity = data.props.dashboard_stats.activity_graph.duration_by_date;
  // { start_date, end_date, duration_by_date: { date, duration (in seconds) } }
  let k = Object.keys(activity);
  let max = 0;
  for(let i = 0; i < k.length; i++) {
    if (activity[k[i]] > max) max = activity[k[i]];
  }
  for(let i = 0; i < k.length; i++) {
    days.push({ date: k[i], count: activity[k[i]] / 60, level: toLevel(activity[k[i]], max) });
  }

  return days;
}

function toLevel(minutes, max) {
  if (max === 0) return 0;
  const t = (minutes / max) * 180;
  if (t === 0) return 0;
  if (t < 30) return 1;
  if (t < 60) return 2;
  if (t < 180) return 3;
  return 4;
}

export async function GET() {
  let f = await fetch(
    "https://hackatime.hackclub.com",
    {
      headers: {
        Cookie: `${process.env.HACKATIME_COOKIE}`,
      },
    }
  );

  if (!f.ok) {
    return Response.json(
      { error: "Failed to fetch data" },
      { status: f.status }
    );
  }

  const html = await f.text();
  const days = parseActivity(html);

  return Response.json(days ?? { error: "Not found" });
}
