import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL is required");

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).send("Failed to fetch");

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=43200"); // 1 hari cache
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
}
