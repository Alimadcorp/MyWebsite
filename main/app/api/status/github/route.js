import { XMLParser } from "fast-xml-parser";

export async function GET() {
  const username = "Alimadcorp";
  const base = `https://stats.github.alimad.co/api`;
  const url = `https://hackatime.hackclub.com/api/v1/users/U08LQFRBL6S/projects/details`;
  const url2 = `https://hackatime.hackclub.com/api/hackatime/v1/users/current/stats/last_7_days`;

  try {
    const [mainSvgRes, langSvgRes, wakatimeRes, statusRes, res, res2] =
      await Promise.all([
        fetch(`${base}?username=${username}&show_icons=true`),
        fetch(`${base}/top-langs?username=${username}`),
        fetch("https://hackatime.hackclub.com/api/v1/users/U08LQFRBL6S/stats"),
        fetch(
          "https://hackatime.hackclub.com/api/hackatime/v1/users/U08LQFRBL6S/statusbar/today?api_key=" +
            process.env.HACKATIME_API_KEY
        ),
        fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
          },
        }),
        fetch(url2, {
          headers: {
            Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
          },
        }),
      ]);

    const [mainSvg, langSvg, wakatimeJson, statusJson, data, data2] = await Promise.all([
      mainSvgRes.text(),
      langSvgRes.text(),
      wakatimeRes.json(),
      statusRes.json(),
      res.json(),
      res2.json(),
    ]);
    let out = data2.data;
    const sorted = data.projects
      .sort((a, b) => new Date(b.last_heartbeat) - new Date(a.last_heartbeat))
      .slice(0, 5);
    let latest_project = sorted[0];
    out = {
      total_week: out.human_readable_total
        .replaceAll(" hrs", "h")
        .replaceAll(" mins", "m"),
      daily_average: out.human_readable_daily_average
        .replaceAll(" hrs", "h")
        .replaceAll(" mins", "m"),
      editors: out.editors,
      languages: out.languages,
      machines: out.machines,
      projects: out.projects,
    };
    let lp = out.projects.find((p) => p.name === latest_project.name);
    lp = { ...lp, ...latest_project, latest: true };
    out.projects = out.projects.map((p) => {
      if (p.name === latest_project.name) {
        return lp;
      }
      return p;
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "text",
    });
    const json = parser.parse(mainSvg);

    let texts = [];
    const walk = (obj) => {
      if (!obj || typeof obj !== "object") return;
      if (typeof obj.text === "string" && obj.text.trim())
        texts.push(obj.text.trim());
      for (const v of Object.values(obj)) walk(v);
    };
    walk(json);

    const statsBlock = texts[1]?.split(",") || [];
    const values = {};
    for (const item of statsBlock) {
      const [k, v] = item.split(":").map((s) => s.trim());
      if (!k || !v) continue;
      const key = k.toLowerCase().split("(")[0].trim().replaceAll(" ", "_");
      values[key] = v;
    }

    const rank = texts[0]?.split(",")[1]?.trim().replace("Rank: ", "") || "";

    const langTexts = [
      ...langSvg.matchAll(/<text[^>]*class="lang-name"[^>]*>(.*?)<\/text>/g),
    ].map((m) => m[1].trim());
    const langs = {};
    for (let i = 0; i + 1 < langTexts.length; i += 2)
      langs[langTexts[i]] = langTexts[i + 1];
    const wakatimeData = wakatimeJson.data;
    const wakatime = {
      username: wakatimeData.username,
      total_seconds: wakatimeData.human_readable_total,
      daily_average: wakatimeData.human_readable_daily_average,
      total_today: statusJson.data.grand_total.text,
      ...out,
    };

    return Response.json({ username, rank, ...values, langs, wakatime });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
