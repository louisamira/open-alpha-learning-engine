import { z } from "zod";

export const masteryStateSchema = z.enum([
  "unseen",
  "introduced",
  "practicing",
  "mastered",
  "needs_review"
]);

export const conceptMasterySchema = z.object({
  conceptId: z.string().min(1),
  state: masteryStateSchema,
  masteryEstimate: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  retentionRisk: z.number().min(0).max(1),
  misconceptionsObserved: z.array(z.string()).default([]),
  attempts: z.number().int().min(0),
  timeOnTaskSeconds: z.number().int().min(0),
  hintDependency: z.number().min(0).max(1),
  rapidGuessCount: z.number().int().min(0),
  lastEvidenceAt: z.string().datetime().optional()
});

export const learnerModelSchema = z.object({
  learnerId: z.string().min(1),
  conceptMastery: z.record(conceptMasterySchema),
  preferredExplanationStyles: z.array(z.enum(["visual", "analogy", "formal", "step_by_step", "real_world"])).default([]),
  interestProfile: z.array(z.string()).default([]),
  prerequisiteWeaknessPatterns: z.array(z.object({
    conceptId: z.string().min(1),
    evidence: z.string().min(1),
    severity: z.number().min(0).max(1)
  })).default([]),
  updatedAt: z.string().datetime()
});

export type MasteryState = z.infer<typeof masteryStateSchema>;
export type ConceptMastery = z.infer<typeof conceptMasterySchema>;
export type LearnerModel = z.infer<typeof learnerModelSchema>;
