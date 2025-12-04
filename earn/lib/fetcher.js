export async function fetchBlogRaw(id) {
  const i = `cdn.alimad.co/f/Personal/blog/${id}.txt`.replaceAll("//", "/");
  const url = `/api/get?url=https://${i}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.text();
}
