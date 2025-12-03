import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/encode", (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).send("Missing data");
  res.type("text/plain").send(Buffer.from(data).toString("base64"));
});

app.get(/^\/get\/(.+)$/, async (req, res) => {
  const path = req.params[0];
  const url = `https://cdn.alimad.co/f/${path}`;
  const { type } = req.query;
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(404).send("Not found");
    const typeq = r.headers.get("content-type") || "";
    const len = parseInt(r.headers.get("content-length") || "0", 10);
    const allowed =
      typeq.startsWith("text/") ||
      typeq.startsWith("application/") ||
      typeq.startsWith("audio/") ||
      typeq.startsWith("video/") ||
      typeq.startsWith("image/");
    const tooBig = len > 5 * 1024 * 1024;
    if (!allowed || tooBig) {
      return res.redirect(url);
    }
    res.setHeader("Content-Type", type || typeq);
    res.setHeader("Content-Disposition", "inline");
    r.body.pipe(res);
  } catch {
    res.status(500).send("Upstream error");
  }
});

app.get("/", (req, res) => {
  const { body, type } = req.query;
  if (type) res.type(type);
  res.send(body || "No body provided");
});

app.get("/:b64", (req, res) => {
  const { b64 } = req.params;
  const { body, type } = req.query;
  try {
    const decoded = Buffer.from(b64, "base64").toString();
    const out = body || decoded;
    if (type) res.type(type);
    res.send(out);
  } catch {
    res.status(400).send("Invalid Base64");
  }
});

app.listen(3000);
