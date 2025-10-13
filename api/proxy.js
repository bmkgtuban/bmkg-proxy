import fetch from "node-fetch";

// In-memory cache: hanya menyimpan 2 tanggal terakhir
const cache = {}; // { "YYYYMMDD_URL": Buffer }

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL required");

  try {
    // Ambil tanggal dari nama file (misal ..._20251014.png)
    const match = url.match(/_(\d{8})\.png$/);
    const dateCode = match ? match[1] : "unknown";

    // Cek cache
    if (cache[url]) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600"); // 1 jam
      return res.send(cache[url]);
    }

    // Fetch gambar dari BMKG
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const buffer = await response.buffer();

    // Simpan di cache (hanya tanggal hari ini dan besok)
    cache[url] = buffer;

    // Limit cache size: hapus URL lama (lebih dari 2)
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
