export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url parameter" });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept":
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        "Referer": "https://stamet-juanda.bmkg.go.id/",
        "Origin": "https://stamet-juanda.bmkg.go.id",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Fetch gagal: ${response.statusText}`
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "image/png"
    );

    res.status(200).send(buffer);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy gagal" });
  }
}
