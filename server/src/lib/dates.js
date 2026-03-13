import { z } from "zod";

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export function atMidnightUtc(isoDate) {
  // isoDate: YYYY-MM-DD
  return new Date(`${isoDate}T00:00:00.000Z`);
}

