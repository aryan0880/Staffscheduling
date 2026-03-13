import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { adminStaffRouter } from "./routes/admin/staff.js";
import { adminShiftsRouter } from "./routes/admin/shifts.js";
import { adminAssignmentsRouter } from "./routes/admin/assignments.js";
import { adminLeaveRequestsRouter } from "./routes/admin/leaveRequests.js";

const env = z
  .object({
    PORT: z.coerce.number().default(5174),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
  })
  .parse(process.env);

const app = express();

app.use(helmet());
const allowedOrigins = new Set(
  env.CORS_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    // common local variants
    .flatMap((o) => (o.includes("localhost") ? [o, o.replace("localhost", "127.0.0.1")] : [o]))
);
app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/me", meRouter);

app.use("/admin/staff", adminStaffRouter);
app.use("/admin/shifts", adminShiftsRouter);
app.use("/admin/assignments", adminAssignmentsRouter);
app.use("/admin/leave-requests", adminLeaveRequestsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "Invalid request", details: err.flatten() });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(env.PORT, () => {
  console.log(`SSMS API listening on http://localhost:${env.PORT}`);
});

