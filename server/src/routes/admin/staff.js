import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { getInitials } from "../../lib/auth.js";

export const adminStaffRouter = express.Router();

adminStaffRouter.use(requireAuth, requireRole("admin"));

adminStaffRouter.get("/", async (_req, res, next) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: "staff" },
      orderBy: { name: "asc" },
      select: { id: true, role: true, name: true, email: true, department: true, contact: true, availability: true }
    });
    res.json(staff.map((s) => ({ ...s, initials: getInitials(s.name) })));
  } catch (e) {
    next(e);
  }
});

adminStaffRouter.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        department: z.string().optional(),
        contact: z.string().optional(),
        availability: z.string().optional(),
        password: z.string().min(6).optional()
      })
      .parse(req.body);

    const passwordHash = await bcrypt.hash(body.password || "staff123", 10);
    const user = await prisma.user.create({
      data: {
        role: "staff",
        name: body.name,
        email: body.email.toLowerCase().trim(),
        department: body.department,
        contact: body.contact,
        availability: body.availability,
        passwordHash
      },
      select: { id: true, role: true, name: true, email: true, department: true, contact: true, availability: true }
    });
    res.status(201).json({ ...user, initials: getInitials(user.name) });
  } catch (e) {
    next(e);
  }
});

adminStaffRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = z
      .object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        department: z.string().nullable().optional(),
        contact: z.string().nullable().optional(),
        availability: z.string().nullable().optional(),
        password: z.string().min(6).optional()
      })
      .parse(req.body);

    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email.toLowerCase().trim();
    if (body.department !== undefined) data.department = body.department;
    if (body.contact !== undefined) data.contact = body.contact;
    if (body.availability !== undefined) data.availability = body.availability;
    if (body.password !== undefined) data.passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, role: true, name: true, email: true, department: true, contact: true, availability: true }
    });
    res.json({ ...user, initials: getInitials(user.name) });
  } catch (e) {
    next(e);
  }
});

adminStaffRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

