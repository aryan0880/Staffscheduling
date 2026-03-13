import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { atMidnightUtc, isoDateSchema } from "../../lib/dates.js";

export const adminAssignmentsRouter = express.Router();

adminAssignmentsRouter.use(requireAuth, requireRole("admin"));

adminAssignmentsRouter.get("/", async (req, res, next) => {
  try {
    const q = z
      .object({
        from: isoDateSchema.optional(),
        to: isoDateSchema.optional()
      })
      .parse(req.query);

    const where = {};
    if (q.from || q.to) {
      where.date = {};
      if (q.from) where.date.gte = atMidnightUtc(q.from);
      if (q.to) where.date.lte = atMidnightUtc(q.to);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: [{ date: "asc" }, { id: "asc" }],
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        shift: true
      }
    });

    res.json(assignments);
  } catch (e) {
    next(e);
  }
});

adminAssignmentsRouter.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        userId: z.number().int().positive(),
        shiftId: z.number().int().positive(),
        date: isoDateSchema
      })
      .parse(req.body);

    const date = atMidnightUtc(body.date);

    const approvedLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId: body.userId,
        status: "approved",
        fromDate: { lte: date },
        toDate: { gte: date }
      }
    });
    if (approvedLeave) {
      return res.status(409).json({ error: "Staff member is on approved leave for this date" });
    }

    const assignment = await prisma.assignment.create({
      data: { userId: body.userId, shiftId: body.shiftId, date },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        shift: true
      }
    });
    res.status(201).json(assignment);
  } catch (e) {
    // Prisma unique constraint: userId+date
    if (String(e?.code || "").toLowerCase() === "p2002") {
      return res.status(409).json({ error: "Staff member already has an assignment for this date" });
    }
    next(e);
  }
});

adminAssignmentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.assignment.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

