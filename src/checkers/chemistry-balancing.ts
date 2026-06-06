export interface ChemistryBalanceInput {
  skeletonEquation: string;
  response: string;
}

export interface CheckerResult {
  correct: boolean;
  message: string;
}

type AtomCounts = Map<string, number>;
type ParsedTerm = {
  coefficient: number;
  formula: string;
  atoms: AtomCounts;
};
type ParsedEquation = {
  left: ParsedTerm[];
  right: ParsedTerm[];
};

export function checkChemistryBalance(input: ChemistryBalanceInput): CheckerResult {
  try {
    const skeleton = parseEquation(input.skeletonEquation);
    const response = parseEquation(input.response);

    if (!sameFormulaSequence(skeleton.left, response.left) || !sameFormulaSequence(skeleton.right, response.right)) {
      return {
        correct: false,
        message: "The response must use the same formulas in the same order as the skeleton equation."
      };
    }

    return isBalanced(response)
      ? { correct: true, message: "The equation conserves every atom on both sides." }
      : { correct: false, message: "The equation does not conserve every atom on both sides." };
  } catch (error) {
    return {
      correct: false,
      message: error instanceof Error ? error.message : "Could not parse chemical equation."
    };
  }
}

export function parseEquation(equation: string): ParsedEquation {
  const [leftRaw, rightRaw, extra] = equation.split(/\s*(?:->|=)\s*/);
  if (!leftRaw || !rightRaw || extra !== undefined) {
    throw new Error("Equation must contain exactly one arrow or equals sign.");
  }

  return {
    left: leftRaw.split(/\s*\+\s*/).map(parseTerm),
    right: rightRaw.split(/\s*\+\s*/).map(parseTerm)
  };
}

function parseTerm(rawTerm: string): ParsedTerm {
  const term = rawTerm.trim();
  const match = term.match(/^(\d+)?\s*([A-Za-z0-9()]+)$/);
  if (!match) {
    throw new Error(`Invalid equation term "${rawTerm}".`);
  }

  const coefficient = match[1] ? Number(match[1]) : 1;
  if (!Number.isInteger(coefficient) || coefficient <= 0) {
    throw new Error("Coefficients must be positive whole numbers.");
  }

  const formula = match[2];
  return {
    coefficient,
    formula,
    atoms: parseFormula(formula)
  };
}

function parseFormula(formula: string): AtomCounts {
  const parser = new FormulaParser(formula);
  const atoms = parser.parseGroup();
  parser.expectEnd();
  return atoms;
}

class FormulaParser {
  private index = 0;

  constructor(private readonly formula: string) {}

  parseGroup(): AtomCounts {
    let counts: AtomCounts = new Map();

    while (this.index < this.formula.length && this.formula[this.index] !== ")") {
      if (this.formula[this.index] === "(") {
        this.index += 1;
        const group = this.parseGroup();
        if (this.formula[this.index] !== ")") {
          throw new Error("Expected closing parenthesis in formula.");
        }
        this.index += 1;
        counts = addCounts(counts, group, this.parseNumber());
        continue;
      }

      const element = this.parseElement();
      counts.set(element, (counts.get(element) ?? 0) + this.parseNumber());
    }

    return counts;
  }

  expectEnd(): void {
    if (this.index !== this.formula.length) {
      throw new Error("Unexpected formula content.");
    }
  }

  private parseElement(): string {
    const match = this.formula.slice(this.index).match(/^[A-Z][a-z]?/);
    if (!match) {
      throw new Error(`Expected element symbol near "${this.formula.slice(this.index)}".`);
    }
    this.index += match[0].length;
    return match[0];
  }

  private parseNumber(): number {
    const match = this.formula.slice(this.index).match(/^\d+/);
    if (!match) {
      return 1;
    }
    this.index += match[0].length;
    return Number(match[0]);
  }
}

function isBalanced(equation: ParsedEquation): boolean {
  return sameCounts(sideCounts(equation.left), sideCounts(equation.right));
}

function sideCounts(terms: ParsedTerm[]): AtomCounts {
  let total: AtomCounts = new Map();
  for (const term of terms) {
    total = addCounts(total, term.atoms, term.coefficient);
  }
  return total;
}

function addCounts(base: AtomCounts, addition: AtomCounts, multiplier: number): AtomCounts {
  const result = new Map(base);
  for (const [atom, count] of addition) {
    result.set(atom, (result.get(atom) ?? 0) + count * multiplier);
  }
  return result;
}

function sameCounts(left: AtomCounts, right: AtomCounts): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const [atom, count] of left) {
    if (right.get(atom) !== count) {
      return false;
    }
  }

  return true;
}

function sameFormulaSequence(left: ParsedTerm[], right: ParsedTerm[]): boolean {
  return left.length === right.length && left.every((term, index) => term.formula === right[index]?.formula);
}
