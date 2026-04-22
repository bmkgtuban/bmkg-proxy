export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url parameter" });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      },
      redirect: "follow"
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
