import fetch from "node-fetch";

// In-memory cache: { URL: { buffer, lastModified } }
const cache = {};

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL required");

  try {
    const cached = cache[url];

    // Ambil header Last-Modified dari server BMKG untuk cek update
    const headResp = await fetch(url, { method: "HEAD" });
    if (!headResp.ok) throw new Error("Failed to fetch headers from BMKG");

    const remoteLastModified = headResp.headers.get("last-modified") || "";

    // Jika cache ada & lastModified sama, pakai cache
    if (cached && cached.lastModified === remoteLastModified) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(cached.buffer);
    }

    // Fetch file terbaru dari BMKG
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from BMKG");

    const buffer = await response.buffer();

    // Update cache
    cache[url] = {
      buffer,
      lastModified: remoteLastModified
    };

    // Batasi cache hanya 2 tanggal terakhir
    const keys = Object.keys(cache);
    if (keys.length > 2) delete cache[keys[0]];

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
}
