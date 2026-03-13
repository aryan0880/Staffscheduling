import express from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const adminShiftsRouter = express.Router();

adminShiftsRouter.use(requireAuth, requireRole("admin"));

adminShiftsRouter.get("/", async (_req, res, next) => {
  try {
    const shifts = await prisma.shift.findMany({ orderBy: { name: "asc" } });
    res.json(shifts);
  } catch (e) {
    next(e);
  }
});

adminShiftsRouter.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        type: z.string().optional(),
        staffCount: z.number().int().min(0).optional()
      })
      .parse(req.body);

    const shift = await prisma.shift.create({ data: body });
    res.status(201).json(shift);
  } catch (e) {
    next(e);
  }
});

adminShiftsRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = z
      .object({
        name: z.string().min(1).optional(),
        startTime: z.string().min(1).optional(),
        endTime: z.string().min(1).optional(),
        type: z.string().optional(),
        staffCount: z.number().int().min(0).optional()
      })
      .parse(req.body);

    const shift = await prisma.shift.update({ where: { id }, data: body });
    res.json(shift);
  } catch (e) {
    next(e);
  }
});

adminShiftsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.shift.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

