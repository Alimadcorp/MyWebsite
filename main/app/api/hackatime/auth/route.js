export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return Response.json({ error: "Missing code" }, { status: 400 })
  }

  const res = await fetch("https://hackatime.hackclub.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.HKTIME_ID,
      client_secret: process.env.HKTIME_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: "https://hackclub.com/api/hackatime/auth"
    })
  })

  const data = await res.json()

  console.log("OAuth response:", data)
  console.log("Access Token:", data.access_token)

  return Response.json(data)
}