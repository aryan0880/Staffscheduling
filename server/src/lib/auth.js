import jwt from "jsonwebtoken";
import { z } from "zod";

const env = z
  .object({
    JWT_SECRET: z.string().min(10).default("dev_secret_change_me"),
    JWT_EXPIRES_IN: z.string().default("7d")
  })
  .parse(process.env);

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

