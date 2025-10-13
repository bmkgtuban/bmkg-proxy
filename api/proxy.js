// api/proxy.js
export default async function handler(req, res) {
  const url = req.query.url || (req.url && req.url.split('?url=')[1]);
  if (!url) {
    res.status(400).send('Missing url parameter');
    return;
  }

  try {
    // Basic sanity: hanya izinkan domain BMKG untuk mencegah abuse
    const allowedHosts = ['maritim-tanjungperak.bmkg.go.id'];
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.hostname)) {
      res.status(403).send('Host not allowed');
      return;
    }

    // fetch upstream
    const upstream = await fetch(url, { redirect: 'follow', timeout: 20000 });
    if (!upstream.ok) {
      res.status(502).send('Failed to fetch upstream');
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    // CORS + caching headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=1800'); // cache CDN 30 menit

    res.status(200).send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}
