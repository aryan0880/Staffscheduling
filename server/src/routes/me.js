import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { getInitials } from "../lib/auth.js";
import { atMidnightUtc, isoDateSchema } from "../lib/dates.js";

export const meRouter = express.Router();

meRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = Number(req.auth.sub);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true, department: true, contact: true, availability: true }
    });
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ ...user, initials: getInitials(user.name) });
  } catch (e) {
    next(e);
  }
});

meRouter.get("/assignments", requireAuth, async (req, res, next) => {
  try {
    const q = z
      .object({
        from: isoDateSchema.optional(),
        to: isoDateSchema.optional()
      })
      .parse(req.query);

    const userId = Number(req.auth.sub);
    const where = { userId };
    if (q.from || q.to) {
      where.date = {};
      if (q.from) where.date.gte = atMidnightUtc(q.from);
      if (q.to) where.date.lte = atMidnightUtc(q.to);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: [{ date: "asc" }],
      include: { shift: true }
    });
    res.json(assignments);
  } catch (e) {
    next(e);
  }
});

meRouter.get("/leave-requests", requireAuth, async (req, res, next) => {
  try {
    const userId = Number(req.auth.sub);
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }]
    });
    res.json(leaves);
  } catch (e) {
    next(e);
  }
});

meRouter.post("/leave-requests", requireAuth, async (req, res, next) => {
  try {
    const body = z
      .object({
        fromDate: isoDateSchema,
        toDate: isoDateSchema,
        reason: z.string().min(2)
      })
      .parse(req.body);

    const fromDate = atMidnightUtc(body.fromDate);
    const toDate = atMidnightUtc(body.toDate);
    if (fromDate > toDate) return res.status(400).json({ error: "fromDate must be <= toDate" });

    const userId = Number(req.auth.sub);
    const created = await prisma.leaveRequest.create({
      data: { userId, fromDate, toDate, reason: body.reason, status: "pending" }
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

meRouter.delete("/leave-requests/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.auth.sub);
    const lr = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!lr || lr.userId !== userId) return res.status(404).json({ error: "Leave request not found" });
    if (lr.status !== "pending") return res.status(409).json({ error: "Only pending requests can be deleted" });
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

