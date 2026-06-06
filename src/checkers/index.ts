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
  }
}
