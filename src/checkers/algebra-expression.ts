type Exponents = Map<string, number>;
type Polynomial = Map<string, number>;

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "plus" | "minus" | "star" | "caret" | "lparen" | "rparen" };

const EPSILON = 1e-9;

export interface AlgebraCheckInput {
  originalExpression: string;
  expectedExpression: string;
  response: string;
}

export interface CheckerResult {
  correct: boolean;
  message: string;
}

export function checkAlgebraSimplification(input: AlgebraCheckInput): CheckerResult {
  try {
    const original = parsePolynomial(input.originalExpression);
    const expected = parsePolynomial(input.expectedExpression);
    const response = parsePolynomial(input.response);

    if (!samePolynomial(original, expected)) {
      return {
        correct: false,
        message: "The authored expected expression is not equivalent to the original expression."
      };
    }

    return samePolynomial(expected, response)
      ? { correct: true, message: "The expression is equivalent to the expected simplified form." }
      : { correct: false, message: "The expression is not equivalent to the expected simplified form." };
  } catch (error) {
    return {
      correct: false,
      message: error instanceof Error ? error.message : "Could not parse expression."
    };
  }
}

export function parsePolynomial(expression: string): Polynomial {
  const parser = new Parser(tokenize(expression));
  const polynomial = parser.parseExpression();
  parser.expectEnd();
  return normalize(polynomial);
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parseExpression(): Polynomial {
    let result = this.parseTerm();

    while (this.peek()?.type === "plus" || this.peek()?.type === "minus") {
      const operator = this.next().type;
      const term = this.parseTerm();
      result = operator === "plus" ? add(result, term) : subtract(result, term);
    }

    return result;
  }

  private parseTerm(): Polynomial {
    let result = this.parseFactor();

    while (true) {
      const token = this.peek();
      if (token?.type === "star") {
        this.next();
        result = multiply(result, this.parseFactor());
        continue;
      }

      if (token && startsFactor(token)) {
        result = multiply(result, this.parseFactor());
        continue;
      }

      break;
    }

    return result;
  }

  private parseFactor(): Polynomial {
    let sign = 1;
    while (this.peek()?.type === "plus" || this.peek()?.type === "minus") {
      sign *= this.next().type === "minus" ? -1 : 1;
    }

    let base = this.parseAtom();
    if (sign === -1) {
      base = scale(base, -1);
    }

    if (this.peek()?.type === "caret") {
      this.next();
      const exponentToken = this.next();
      if (exponentToken.type !== "number" || !Number.isInteger(exponentToken.value) || exponentToken.value < 0) {
        throw new Error("Exponents must be nonnegative integers.");
      }
      base = pow(base, exponentToken.value);
    }

    return base;
  }

  private parseAtom(): Polynomial {
    const token = this.next();

    if (token.type === "number") {
      return polynomialFromTerm(token.value, new Map());
    }

    if (token.type === "identifier") {
      return polynomialFromTerm(1, new Map([[token.value, 1]]));
    }

    if (token.type === "lparen") {
      const expression = this.parseExpression();
      const close = this.next();
      if (close.type !== "rparen") {
        throw new Error("Expected closing parenthesis.");
      }
      return expression;
    }

    throw new Error("Expected a number, variable, or parenthesized expression.");
  }

  expectEnd(): void {
    if (this.peek()) {
      throw new Error("Unexpected token after expression.");
    }
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private next(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error("Unexpected end of expression.");
    }
    this.index += 1;
    return token;
  }
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = expression.slice(index).match(/^\d+(?:\.\d+)?|^\.\d+/);
      if (!match) {
        throw new Error(`Invalid number near "${expression.slice(index)}".`);
      }
      tokens.push({ type: "number", value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      tokens.push({ type: "identifier", value: char.toLowerCase() });
      index += 1;
      continue;
    }

    const operatorMap = {
      "+": "plus",
      "-": "minus",
      "*": "star",
      "^": "caret",
      "(": "lparen",
      ")": "rparen"
    } as const;
    const type = operatorMap[char as keyof typeof operatorMap];
    if (!type) {
      throw new Error(`Unsupported character "${char}".`);
    }
    tokens.push({ type });
    index += 1;
  }

  return tokens;
}

function startsFactor(token: Token): boolean {
  return token.type === "number" || token.type === "identifier" || token.type === "lparen";
}

function polynomialFromTerm(coefficient: number, exponents: Exponents): Polynomial {
  return new Map([[keyFromExponents(exponents), coefficient]]);
}

function add(a: Polynomial, b: Polynomial): Polynomial {
  const result = new Map(a);
  for (const [key, coefficient] of b) {
    result.set(key, (result.get(key) ?? 0) + coefficient);
  }
  return normalize(result);
}

function subtract(a: Polynomial, b: Polynomial): Polynomial {
  return add(a, scale(b, -1));
}

function scale(polynomial: Polynomial, factor: number): Polynomial {
  const result: Polynomial = new Map();
  for (const [key, coefficient] of polynomial) {
    result.set(key, coefficient * factor);
  }
  return normalize(result);
}

function multiply(a: Polynomial, b: Polynomial): Polynomial {
  const result: Polynomial = new Map();
  for (const [leftKey, leftCoefficient] of a) {
    for (const [rightKey, rightCoefficient] of b) {
      const key = multiplyKeys(leftKey, rightKey);
      result.set(key, (result.get(key) ?? 0) + leftCoefficient * rightCoefficient);
    }
  }
  return normalize(result);
}

function pow(polynomial: Polynomial, exponent: number): Polynomial {
  let result = polynomialFromTerm(1, new Map());
  for (let i = 0; i < exponent; i += 1) {
    result = multiply(result, polynomial);
  }
  return result;
}

function normalize(polynomial: Polynomial): Polynomial {
  const result: Polynomial = new Map();
  for (const [key, coefficient] of polynomial) {
    if (Math.abs(coefficient) > EPSILON) {
      result.set(key, coefficient);
    }
  }
  return result;
}

function samePolynomial(a: Polynomial, b: Polynomial): boolean {
  const left = normalize(a);
  const right = normalize(b);

  if (left.size !== right.size) {
    return false;
  }

  for (const [key, coefficient] of left) {
    if (Math.abs(coefficient - (right.get(key) ?? 0)) > EPSILON) {
      return false;
    }
  }

  return true;
}

function multiplyKeys(leftKey: string, rightKey: string): string {
  const exponents = exponentsFromKey(leftKey);
  for (const [variable, exponent] of exponentsFromKey(rightKey)) {
    exponents.set(variable, (exponents.get(variable) ?? 0) + exponent);
  }
  return keyFromExponents(exponents);
}

function keyFromExponents(exponents: Exponents): string {
  return [...exponents.entries()]
    .filter(([, exponent]) => exponent !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([variable, exponent]) => `${variable}^${exponent}`)
    .join("*");
}

function exponentsFromKey(key: string): Exponents {
  const exponents: Exponents = new Map();
  if (!key) {
    return exponents;
  }

  for (const part of key.split("*")) {
    const [variable, exponent] = part.split("^");
    exponents.set(variable, Number(exponent));
  }

  return exponents;
}
