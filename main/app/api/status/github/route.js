import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
export async function GET() {
  const username = "Alimadcorp";
  const base = `https://github-readme-stats.vercel.app/api`;
  const url = `https://hackatime.hackclub.com/api/v1/users/U08LQFRBL6S/projects/details`;
  const url2 = `https://hackatime.hackclub.com/api/hackatime/v1/users/current/stats/last_7_days`;

  const errors = [];
  const safeText = async (res, name) => {
    if (!res) {
      errors.push(`${name}: fetch failed`);
      return null;
    }
    try {
      if (!res.ok) {
        errors.push(`${name}: HTTP ${res.status}`);
        return null;
      }
      return await res.text();
    } catch (e) {
      errors.push(`${name}: text() error ${e?.message || e}`);
      return null;
    }
  };

  const safeJson = async (res, name) => {
    if (!res) {
      errors.push(`${name}: fetch failed`);
      return null;
    }
    try {
      if (!res.ok) {
        errors.push(`${name}: HTTP ${res.status}`);
        return null;
      }
      return await res.json();
    } catch (e) {
      errors.push(`${name}: json() error ${e?.message || e}`);
      return null;
    }
  };

  try {
    const fetchPromises = [
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
      fetch("https://hackatime.hackclub.com/static_pages/mini_leaderboard", {
        headers: {
          Cookie: `${process.env.HACKATIME_COOKIE}`,
        },
      }),
    ];

    const settled = await Promise.allSettled(fetchPromises);
    const responses = settled.map((s, i) => {
      if (s.status === "fulfilled") return s.value;
      errors.push(`fetch[${i}] rejected: ${s.reason?.message || s.reason}`);
      return null;
    });

    const [mainSvgRes, langSvgRes, wakatimeRes, statusRes, res, res2, lb] =
      responses;

    const [mainSvg, langSvg, wakatimeJson, statusJson, data, data2, lbr] =
      await Promise.all([
        safeText(mainSvgRes, "mainSvg"),
        safeText(langSvgRes, "langSvg"),
        safeJson(wakatimeRes, "wakatime"),
        safeJson(statusRes, "status"),
        safeJson(res, "projects"),
        safeJson(res2, "last7"),
        safeText(lb, "leaderboard"),
      ]);
    const langs = {};
    let values = {};
    let rank = "";
    let wakatime = { username: "AlimadCo" };
    try {
      const projectsData = data?.projects || [];
      const sorted = (projectsData || [])
        .slice()
        .sort((a, b) => new Date(b.last_heartbeat) - new Date(a.last_heartbeat))
        .slice(0, 5);
      const latest_project = sorted[0] || null;

      const outSource = data2?.data || {};
      const out = {
        total_week: (outSource.human_readable_total || "")
          .replaceAll(" hrs", "h")
          .replaceAll(" mins", "m"),
        daily_average: (outSource.human_readable_daily_average || "")
          .replaceAll(" hrs", "h")
          .replaceAll(" mins", "m"),
        editors: outSource.editors || [],
        languages: outSource.languages || [],
        machines: outSource.machines || [],
        projects: outSource.projects || [],
      };

      if (latest_project && out.projects.length) {
        let lp = out.projects.find((p) => p.name === latest_project.name) || {};
        lp = { ...lp, ...latest_project, latest: true };
        out.projects = out.projects.map((p) =>
          p.name === latest_project.name ? lp : p
        );
      }
      wakatime = { ...wakatime, ...out };
    } catch (e) {
      errors.push(`projects processing error: ${e?.message || e}`);
    }
    if (mainSvg) {
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
          textNodeName: "text",
        });
        const json = parser.parse(mainSvg);
        const texts = [];
        const walk = (obj) => {
          if (!obj || typeof obj !== "object") return;
          if (typeof obj.text === "string" && obj.text.trim())
            texts.push(obj.text.trim());
          for (const v of Object.values(obj)) walk(v);
        };
        walk(json);

        const statsBlock = texts[1]?.split(",") || [];
        for (const item of statsBlock) {
          const parts = item.split(":").map((s) => s.trim());
          if (parts.length < 2) continue;
          const key = parts[0]
            .toLowerCase()
            .split("(")[0]
            .trim()
            .replaceAll(" ", "_");
          values[key] = parts.slice(1).join(":");
        }

        rank = texts[0]?.split(",")[1]?.trim().replace("Rank: ", "") || "";
      } catch (e) {
        errors.push(`mainSvg parse error: ${e?.message || e}`);
      }
    }
    if (langSvg) {
      try {
        const langTexts = [
          ...langSvg.matchAll(
            /<text[^>]*class="lang-name"[^>]*>(.*?)<\/text>/g
          ),
        ].map((m) => m[1].trim());
        for (let i = 0; i + 1 < langTexts.length; i += 2) {
          langs[langTexts[i]] = langTexts[i + 1];
        }
      } catch (e) {
        errors.push(`langSvg parse error: ${e?.message || e}`);
      }
    }
    try {
      const wakatimeData = wakatimeJson?.data || {};
      wakatime = {
        username: wakatimeData.username || wakatime.username || username,
        total_seconds: wakatimeData.human_readable_total || "",
        daily_average: wakatimeData.human_readable_daily_average || "",
        total_today: statusJson?.data?.grand_total?.text || "",
        ...wakatime,
      };
    } catch (e) {
      errors.push(`wakatime processing error: ${e?.message || e}`);
    }
    try {
      if (lbr) {
        const $ = cheerio.load(lbr);
        let found = null;
        $(".flex.items-center.p-3").each((_, el) => {
          if (found) return;
          const position = $(el).find(".w-8.text-center.text-lg").text().trim();
          const userSpan = $(el).find(".user-info span").first().text().trim();
          if (!userSpan || !userSpan.toLowerCase().includes("alimadco")) return;
          let streak = null;
          const streakBox = $(el).find(".super span.text-md");
          if (streakBox.length) streak = streakBox.text().trim();
          found = {
            username: userSpan,
            position,
            streak,
          };
        });
        if (found) {
          wakatime = { ...found, ...wakatime };
        }
      }
    } catch (e) {
      errors.push(`leaderboard parse error: ${e?.message || e}`);
    }
    if(wakatime?.total_today.startsWith("Start")){
      wakatime.total_today = "0m";
    }
    const payload = { username, rank, ...values, langs, wakatime };
    if (errors.length) payload._warnings = errors;
    return Response.json(payload);
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
