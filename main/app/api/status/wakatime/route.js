import * as cheerio from "cheerio";

function parseActivity(html) {
  const $ = cheerio.load(html);
  const days = [];

  $(".day").each((_, el) => {
    const date = $(el).attr("data-date");
    const duration = $(el).attr("data-duration") || "";
    const count = toMinutes(duration);
    const level = toLevel(count);

    days.push({ date, count, level });
  });

  return days;
}

function toMinutes(str) {
  if (!str) return 0;
  const s = str.toLowerCase();

  if (s.includes("less than a minute")) return 0;
  if (/(\d+)\s*minutes?/.test(s))
    return parseInt(s.match(/(\d+)\s*minutes?/)[1]);
  if (/(\d+)\s*hours?/.test(s))
    return parseInt(s.match(/(\d+)\s*hours?/)[1]) * 60;

  return 0;
}

function toLevel(minutes) {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 180) return 3;
  return 4;
}

export async function GET() {
  let f = await fetch(
    "https://hackatime.hackclub.com/static_pages/activity_graph",
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
