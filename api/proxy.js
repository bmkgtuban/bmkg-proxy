export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url parameter" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch: ${response.statusText}` });
    }

    // Read response as arrayBuffer (binary)
    const buffer = Buffer.from(await response.arrayBuffer());

    // Set CORS + content headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    // Send the image or binary data
    res.status(200).send(buffer);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
