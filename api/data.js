const crypto = require("crypto");

function sessionToken() {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET).update("authenticated").digest("hex");
}

function verifyToken(token) {
  if (!token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(sessionToken());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifyToken(cookies.session)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const resp = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/site_snapshot?id=eq.1&select=rows_json,routes_html,routes_html_base,total,generated_at`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  if (!resp.ok) {
    res.status(502).json({ error: "supabase fetch failed" });
    return;
  }
  const rows = await resp.json();
  const snapshot = rows[0];
  if (!snapshot) {
    res.status(404).json({ error: "no data" });
    return;
  }
  res.status(200).json({
    rows: snapshot.rows_json,
    routesHtml: snapshot.routes_html,
    routesHtmlBase: snapshot.routes_html_base,
    total: snapshot.total,
    generatedAt: snapshot.generated_at,
  });
};
