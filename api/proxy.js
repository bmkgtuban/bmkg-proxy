import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const CACHE_DIR = "/tmp/cache";
const MAX_CACHE_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari

// Pastikan direktori cache ada
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 🧹 Bersihkan cache lama (>3 hari)
function cleanOldCache() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    const now = Date.now();
    for (const f of files) {
      const filePath = path.join(CACHE_DIR, f);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > MAX_CACHE_AGE_MS) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Deleted old cache: ${f}`);
      }
    }
  } catch (err) {
    console.error("Error cleaning cache:", err);
  }
}

// Jalankan pembersihan cache sekali setiap request
cleanOldCache();

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    // Nama file cache berdasarkan URL
    const filename = path.basename(url);
    const cachePath = path.join(CACHE_DIR, filename);

    // Jika ada di cache → kirim langsung
    if (fs.existsSync(cachePath)) {
      const data = fs.readFileSync(cachePath);
      console.log(`✅ Cache hit: ${filename}`);
      res.setHeader("Content-Type", "image/png");
      return res.send(data);
    }

    // Jika belum ada → ambil dari sumber asli
    console.log(`⬇️ Fetching new image: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch: ${url}`);
    }

    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer);

    // Simpan ke cache
    fs.writeFileSync(cachePath, data);
    console.log(`💾 Cached: ${filename}`);

    res.setHeader("Content-Type", "image/png");
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy server error");
  }
}
