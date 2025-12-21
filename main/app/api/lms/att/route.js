import https from "https";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Key"
};

const agent = new https.Agent({ rejectUnauthorized: false });

function postJson(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request(
      {
        hostname: "lms.gcu.edu.pk",
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "X-Client-Key": token ? "vc4gmsFecSPqhm1mqzKCwBif1rBb4P0xNXgI" : "",
          "Content-Length": Buffer.byteLength(body)
        },
        agent
      },
      res => {
        let chunks = "";
        res.on("data", ch => chunks += ch);
        res.on("end", () => {
          try { resolve(JSON.parse(chunks)); }
          catch { resolve(chunks); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export function OPTIONS() {
  return new Response("ok", { headers: CORS });
}

export async function GET(req) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u") || url.searchParams.get("usnm");
  const p = url.searchParams.get("p") || url.searchParams.get("pwd");
  if (!u || !p) return new Response("Missing params", { status: 400, headers: CORS });

  const login = await postJson("/api/auth/login", { usnm: u, pwd: p });
  const token = login[1];
  const subjectsRaw = login[2] || [];

  const uniqueSubs = {};
  for (let sub of subjectsRaw) uniqueSubs[sub.SUB_NM] = sub;
  const subs = Object.values(uniqueSubs);

  const promises = subs.map(s =>
    postJson("/api/student/getStdAttendance", s, token)
      .then(att => [s.SUB_NM, att])
  );

  const results = Object.fromEntries(await Promise.all(promises));

  return new Response(JSON.stringify(results), { headers: CORS });
}
