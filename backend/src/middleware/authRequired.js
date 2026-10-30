const jwt = require("jsonwebtoken");
function authRequired(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof payload !== "object" || typeof payload.userId !== "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.user = { id: payload.userId };
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  next();
}
module.exports = authRequired;
