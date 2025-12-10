export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  return res.status(500).json({ error: "bruh" });
  const response = await fetch(
    "https://api.minehut.com/server/68693aafaf750c7827eadad9/start",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_SECRET_JWT_HERE",
        "x-profile-id": "645c4884-6a40-4e36-a7eb-a42c75d509f8",
        "x-session-id": "35f85402-ce0a-468c-9a30-4c8ddfc299ab",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}
