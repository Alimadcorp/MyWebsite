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
  if (!u) return new Response("Missing params", { status: 400, headers: CORS });

  const agent = new https.Agent({ rejectUnauthorized: false });

  const options = {
    hostname: "lms.gcu.edu.pk",
    path: "/api/student/getStudentInformation/"+u,
    method: "GET",
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7IlJPTEUiOiJTVERSIiwiWUVBUiI6MjAyNSwiQ19DT0RFIjoxMTEsIlJOIjozMTMzLCJEX0lEIjoxMDAsIk1BSl9JRCI6NjEsIlNFX0lEIjo4NTcsIlJPTE5PIjoiMzEzMy0xLTI1IiwiTk0iOiJTdWJoYW4gQWhtYWQiLCJERVMiOiJGLkEgLyBGLlNjIiwiSU5TVF9OTyI6MX0sImlhdCI6MTc2Mzk1OTczOH0.naRDqizlOADlif2NWlz6vo74juAMCqmFpTj5ZJthRms",
        'X-Client-Key': "vc4gmsFecSPqhm1mqzKCwBif1rBb4P0xNXgI",
        Referer: 'https://lms.gcu.edu.pk/student/studentInformation',
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
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
    req.end();
  });

  return new Response(body, { headers: CORS });
}
