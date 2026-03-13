import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const adminLeaveRequestsRouter = express.Router();

adminLeaveRequestsRouter.use(requireAuth, requireRole("admin"));

adminLeaveRequestsRouter.get("/", async (req, res, next) => {
  try {
    const q = z
      .object({
        status: z.enum(["pending", "approved", "rejected"]).optional()
      })
      .parse(req.query);

    const where = {};
    if (q.status) where.status = q.status;

    const leaves = await prisma.leaveRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: { user: { select: { id: true, name: true, email: true, department: true } } }
    });

    res.json(leaves);
  } catch (e) {
    next(e);
  }
});

adminLeaveRequestsRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = z
      .object({
        status: z.enum(["pending", "approved", "rejected"])
      })
      .parse(req.body);

    if (body.status === "approved") {
      const leave = await prisma.leaveRequest.findUnique({ where: { id } });
      if (!leave) return res.status(404).json({ error: "Leave request not found" });

      const conflictingAssignments = await prisma.assignment.findFirst({
        where: {
          userId: leave.userId,
          date: { gte: leave.fromDate, lte: leave.toDate }
        }
      });
      if (conflictingAssignments) {
        return res.status(409).json({ error: "Cannot approve leave that conflicts with assigned shifts" });
      }
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: body.status },
      include: { user: { select: { id: true, name: true, email: true, department: true } } }
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

