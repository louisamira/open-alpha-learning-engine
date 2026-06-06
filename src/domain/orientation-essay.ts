import { z } from "zod";

export const orientationEssayScopeSchema = z.enum(["track", "unit", "concept"]);

export const orientationEssaySchema = z.object({
  id: z.string().min(1),
  scope: orientationEssayScopeSchema,
  targetId: z.string().min(1),
  title: z.string().min(1),
  readingMinutes: z.number().int().min(1).max(10),
  plainLanguageSummary: z.string().min(40),
  historicalOrigin: z.string().min(40),
  socialImportance: z.string().min(40),
  whyLearnersCare: z.string().min(40),
  commonObjections: z.array(z.string().min(10)).min(1),
  safelyIgnoreForNow: z.array(z.string().min(5)).default([]),
  deeperPaths: z.array(z.string().min(10)).min(1),
  sourceNotes: z.array(z.string().min(5)).min(1)
});

export type OrientationEssayScope = z.infer<typeof orientationEssayScopeSchema>;
export type OrientationEssay = z.infer<typeof orientationEssaySchema>;
