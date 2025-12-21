import https from "https";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response("ok", { headers: CORS });
}

export async function GET(request) {
  const url = new URL(request.url);
  const u = url.searchParams.get("u") || url.searchParams.get("usnm");
  const p = url.searchParams.get("p") || url.searchParams.get("pwd");
  if (!u || !p) return new Response("Missing params", { status: 400, headers: CORS });

  const postData = JSON.stringify({ usnm: u, pwd: p });
  const agent = new https.Agent({ rejectUnauthorized: false });

  const options = {
    hostname: "lms.gcu.edu.pk",
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    },
    agent
  };

  const body = await new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });

  return new Response(body, { headers: CORS });
}
