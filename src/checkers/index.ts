import type { CheckerSpec } from "../domain/curriculum-graph.js";
import { checkAccountingEntry } from "./accounting-entry.js";
import { checkAlgebraSimplification } from "./algebra-expression.js";
import { checkChemistryBalance } from "./chemistry-balancing.js";

export interface CheckerResult {
  correct: boolean;
  message: string;
}

export function runSampleChecks(spec: CheckerSpec): { correct: CheckerResult; incorrect: CheckerResult } {
  switch (spec.kind) {
    case "algebra.expression_simplification":
      return {
        correct: checkAlgebraSimplification({
          originalExpression: spec.originalExpression,
          expectedExpression: spec.expectedExpression,
          response: spec.sampleCorrect
        }),
        incorrect: checkAlgebraSimplification({
          originalExpression: spec.originalExpression,
          expectedExpression: spec.expectedExpression,
          response: spec.sampleIncorrect
        })
      };

    case "chemistry.equation_balance":
      return {
        correct: checkChemistryBalance({
          skeletonEquation: spec.skeletonEquation,
          response: spec.sampleCorrect
        }),
        incorrect: checkChemistryBalance({
          skeletonEquation: spec.skeletonEquation,
          response: spec.sampleIncorrect
        })
      };

    case "accounting.journal_entry":
      return {
        correct: checkAccountingEntry({
          expectedLines: spec.expectedLines,
          responseLines: spec.sampleCorrect
        }),
        incorrect: checkAccountingEntry({
          expectedLines: spec.expectedLines,
          responseLines: spec.sampleIncorrect
        })
      };

    case "conceptual.exact_answer":
      return {
        correct: checkExactAnswer({
          expectedAnswers: spec.expectedAnswers,
          response: spec.sampleCorrect,
          caseSensitive: spec.caseSensitive
        }),
        incorrect: checkExactAnswer({
          expectedAnswers: spec.expectedAnswers,
          response: spec.sampleIncorrect,
          caseSensitive: spec.caseSensitive
        })
      };
  }
}

export function checkExactAnswer(input: {
  expectedAnswers: string[];
  response: string;
  caseSensitive?: boolean;
}): CheckerResult {
  const normalize = input.caseSensitive
    ? (value: string) => value.trim().replace(/\s+/g, " ")
    : (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const response = normalize(input.response);
  const accepted = input.expectedAnswers.map(normalize);

  return accepted.includes(response)
    ? { correct: true, message: "The answer matches the expected classification." }
    : { correct: false, message: "The answer does not match the expected classification." };
}
