import { verifyAccessToken } from "../lib/auth.js";

export function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = verifyAccessToken(m[1]);
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth?.role) return res.status(401).json({ error: "Missing auth" });
    if (req.auth.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

