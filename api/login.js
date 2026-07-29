const crypto = require("crypto");

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function sessionToken() {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET).update("authenticated").digest("hex");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const password = (body && body.password) || "";

  if (!safeEqual(password, process.env.REPORT_PASSWORD || "")) {
    res.status(401).json({ error: "비밀번호가 틀렸습니다." });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    `session=${sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
  );
  res.status(200).json({ ok: true });
};
