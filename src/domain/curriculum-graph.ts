import { z } from "zod";
import { orientationEssaySchema } from "./orientation-essay.js";

export const checkerKindSchema = z.enum([
  "algebra.expression_simplification",
  "chemistry.equation_balance",
  "accounting.journal_entry",
  "conceptual.exact_answer"
]);

const checkerSpecBaseSchema = z.object({
  kind: checkerKindSchema
});

export const algebraCheckerSpecSchema = checkerSpecBaseSchema.extend({
  kind: z.literal("algebra.expression_simplification"),
  originalExpression: z.string().min(1),
  expectedExpression: z.string().min(1),
  sampleCorrect: z.string().min(1),
  sampleIncorrect: z.string().min(1)
});

export const chemistryCheckerSpecSchema = checkerSpecBaseSchema.extend({
  kind: z.literal("chemistry.equation_balance"),
  skeletonEquation: z.string().min(1),
  sampleCorrect: z.string().min(1),
  sampleIncorrect: z.string().min(1)
});

export const accountingLineSchema = z.object({
  account: z.string().min(1),
  side: z.enum(["debit", "credit"]),
  amount: z.number().positive()
});

export const accountingCheckerSpecSchema = checkerSpecBaseSchema.extend({
  kind: z.literal("accounting.journal_entry"),
  transaction: z.string().min(1),
  expectedLines: z.array(accountingLineSchema).min(2),
  sampleCorrect: z.array(accountingLineSchema).min(2),
  sampleIncorrect: z.array(accountingLineSchema).min(2)
});

export const exactAnswerCheckerSpecSchema = checkerSpecBaseSchema.extend({
  kind: z.literal("conceptual.exact_answer"),
  expectedAnswers: z.array(z.string().min(1)).min(1),
  sampleCorrect: z.string().min(1),
  sampleIncorrect: z.string().min(1),
  caseSensitive: z.boolean().default(false)
});

export const checkerSpecSchema = z.discriminatedUnion("kind", [
  algebraCheckerSpecSchema,
  chemistryCheckerSpecSchema,
  accountingCheckerSpecSchema,
  exactAnswerCheckerSpecSchema
]);

export const diagnosticProbeSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  checker: checkerSpecSchema,
  misconceptionIds: z.array(z.string()).default([])
});

export const practiceItemSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  checker: checkerSpecSchema,
  hints: z.array(z.string().min(1)).min(1),
  feedback: z.object({
    correct: z.string().min(1),
    incorrect: z.string().min(1)
  })
});

export const masteryCheckSchema = z.object({
  id: z.string().min(1),
  passingThreshold: z.number().min(0).max(1),
  evidenceRequired: z.array(z.string().min(1)).min(1),
  items: z.array(practiceItemSchema).min(1)
});

export const misconceptionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  remediation: z.object({
    type: z.enum(["review_prerequisite", "alternate_explanation", "extra_practice", "worked_example"]),
    targetId: z.string().min(1),
    message: z.string().min(1)
  })
});

export const sourceReferenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  note: z.string().min(1)
});

export const conceptNodeSchema = z.object({
  id: z.string().min(1),
  trackId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  level: z.number().int().min(0),
  prerequisites: z.array(z.string()).default([]),
  objectives: z.array(z.string().min(1)).min(1),
  orientationEssayIds: z.array(z.string()).default([]),
  diagnostics: z.array(diagnosticProbeSchema).min(1),
  practice: z.array(practiceItemSchema).min(1),
  masteryCheck: masteryCheckSchema,
  misconceptions: z.array(misconceptionSchema).default([]),
  sourceReferences: z.array(sourceReferenceSchema).min(1)
});

export const curriculumArtifactSchema = z.object({
  schemaVersion: z.literal("0.1"),
  track: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1)
  }),
  orientationEssays: z.array(orientationEssaySchema).default([]),
  concepts: z.array(conceptNodeSchema).min(1)
});

export type AccountingLine = z.infer<typeof accountingLineSchema>;
export type CheckerSpec = z.infer<typeof checkerSpecSchema>;
export type ConceptNode = z.infer<typeof conceptNodeSchema>;
export type CurriculumArtifact = z.infer<typeof curriculumArtifactSchema>;
