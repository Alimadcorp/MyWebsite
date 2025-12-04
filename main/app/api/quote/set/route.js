import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

const PASSWORD = "PASSWORDISBANANA";
const KVDB_BUCKET = process.env.KVDB_BUCKET;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  if(password !== PASSWORD) return notFound();
  const quote = searchParams.get("quote");
  const writer = searchParams.get("writer");

  if (!quote && !writer) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Set Quote</title>
        <style>
          body {
            background: #0d0d0d;
            color: #00ffff;
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          form {
            border: 1px solid #00ffff66;
            border-radius: 10px;
            padding: 20px 30px;
            background: #00000080;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            width: 90%;
          }
          input, textarea {
            background: #111;
            color: #fff;
            border: 1px solid #00ffff55;
            border-radius: 5px;
            padding: 8px;
            font-size: 14px;
          }
          button {
            background: #00ffff;
            color: #000;
            border: none;
            border-radius: 5px;
            padding: 10px;
            cursor: pointer;
            font-weight: bold;
          }
          button:hover {
            background: #00cccc;
          }
        </style>
      </head>
      <body>
        <h2>Set Quote of the Day</h2>
        <form method="get">
          <input type="password" name="password" placeholder="Password" value="PASSWORDISBANANA" hidden />
          <textarea name="quote" placeholder="Your quote..." rows="3" required></textarea>
          <input type="text" name="writer" placeholder="Writer" required />
          <button type="submit">Set Quote</button>
        </form>
      </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (password !== PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (!quote || !writer)
    return NextResponse.json({ error: "Missing quote or writer" }, { status: 400 });

  const quoteData = {
    quote,
    writer,
    date: new Date().toISOString(),
  };

  await fetch(KVDB_BUCKET, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quoteData),
  }).then(async e => await e.text().then(t => console.log("KVDB response:", t)).catch(() => console.log("KVDB response: <non-text>"))).catch(err => console.error("Error saving quote to KVDB:", err));

  return NextResponse.json({ success: true, quoteData });
}
