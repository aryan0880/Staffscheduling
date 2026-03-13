import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { getInitials, signAccessToken } from "../lib/auth.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authRouter = express.Router();

authRouter.post("/google", async (req, res, next) => {
  try {
    const { credential } = z.object({ credential: z.string() }).parse(req.body);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const { email, name, sub: googleId } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email: normalizedEmail }
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || "Google User",
          googleId,
          role: "staff", // Default role
          department: "Staff",
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department,
        contact: user.contact,
        availability: user.availability,
        initials: getInitials(user.name)
      }
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1)
      })
      .parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department,
        contact: user.contact,
        availability: user.availability,
        initials: getInitials(user.name)
      }
    });
  } catch (e) {
    next(e);
  }
});

