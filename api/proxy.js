import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    // Ambil buffer gambar
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    // Kirim hasilnya ke browser
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1 jam
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
