// app/api/[id]/route.js
import { xml2json } from "xml-js";

function flatten(obj) {
  if (Array.isArray(obj)) {
    return obj.map(flatten);
  } else if (obj && typeof obj === "object") {
    if ("_text" in obj && Object.keys(obj).length === 1) {
      return obj._text;
    }
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      out[key] = flatten(value);
    }
    return out;
  }
  return obj;
}

function formatDate(rfcDate) {
  if (!rfcDate) return null;
  const d = new Date(rfcDate);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}Z`;
}

function normalize(raw) {
  raw = flatten(raw);
  const out = {};
  if (raw["href"]) {
    raw = [raw];
  }
  for (const k of Object.keys(raw)) {
    const entry = raw[k];
    const prop = entry?.propstat?.prop || {};
    const href = entry?.href || "";
    let key = href.replace("/f/Personal/blog", "") || "/";

    out[key] = {
      href: key,
      created: formatDate(prop.creationdate),
      length: prop.getcontentlength,
      type: prop.getcontenttype,
      etag: prop.getetag,
      modified: formatDate(prop.getlastmodified),
    };
  }
  return out;
}

export async function GET(req, { params }) {
  const { id } = await params;

  const url = `https://cdn.alimad.co/f/Personal/${id.join("/")}`;

  const res = await fetch(url, {
    method: "PROPFIND",
    headers: { Depth: "1" },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Failed to fetch from ${url}` },
      { status: res.status }
    );
  }

  const xml = await res.text();

  const items = normalize(JSON.parse(xml2json(xml, { compact: true, spaces: 2 }))
    .multistatus?.response);

  return Response.json({ ...items });
}
