import type { AccountingLine } from "../domain/curriculum-graph.js";

export interface AccountingEntryInput {
  expectedLines: AccountingLine[];
  responseLines: AccountingLine[];
}

export interface CheckerResult {
  correct: boolean;
  message: string;
}

export function checkAccountingEntry(input: AccountingEntryInput): CheckerResult {
  const responseBalance = balance(input.responseLines);

  if (responseBalance.debits <= 0 || responseBalance.credits <= 0) {
    return {
      correct: false,
      message: "A journal entry needs positive debit and credit lines."
    };
  }

  if (responseBalance.debits !== responseBalance.credits) {
    return {
      correct: false,
      message: "Total debits must equal total credits."
    };
  }

  if (!sameLines(input.expectedLines, input.responseLines)) {
    return {
      correct: false,
      message: "The entry balances, but it does not match the expected account, side, and amount lines."
    };
  }

  return {
    correct: true,
    message: "The journal entry balances and uses the expected accounts."
  };
}

function balance(lines: AccountingLine[]): { debits: number; credits: number } {
  return lines.reduce(
    (sum, line) => ({
      debits: sum.debits + (line.side === "debit" ? line.amount : 0),
      credits: sum.credits + (line.side === "credit" ? line.amount : 0)
    }),
    { debits: 0, credits: 0 }
  );
}

function sameLines(expected: AccountingLine[], actual: AccountingLine[]): boolean {
  const expectedKeys = expected.map(lineKey).sort();
  const actualKeys = actual.map(lineKey).sort();

  return expectedKeys.length === actualKeys.length && expectedKeys.every((key, index) => key === actualKeys[index]);
}

function lineKey(line: AccountingLine): string {
  return `${line.account.toLowerCase().trim()}|${line.side}|${line.amount}`;
}
