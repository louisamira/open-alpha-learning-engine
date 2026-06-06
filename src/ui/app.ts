import { checkAccountingEntry } from "../checkers/accounting-entry.js";
import { checkAlgebraSimplification } from "../checkers/algebra-expression.js";
import { checkChemistryBalance } from "../checkers/chemistry-balancing.js";
import type { AccountingLine, CheckerSpec } from "../domain/curriculum-graph.js";

type PracticeItem = {
  id: string;
  prompt: string;
  checker: CheckerSpec;
  hints: string[];
  feedback: {
    correct: string;
    incorrect: string;
  };
};

type Concept = {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  orientationEssayIds: string[];
  diagnostics: PracticeItem[];
  practice: PracticeItem[];
  masteryCheck: {
    evidenceRequired: string[];
    items: PracticeItem[];
  };
};

type OrientationEssay = {
  id: string;
  title: string;
  readingMinutes: number;
  plainLanguageSummary: string;
  historicalOrigin: string;
  socialImportance: string;
  whyLearnersCare: string;
};

type Artifact = {
  track: {
    id: string;
    title: string;
    summary: string;
  };
  orientationEssays: OrientationEssay[];
  concepts: Concept[];
};

const curriculumFiles = [
  "/curriculum/algebra1/expressions.json",
  "/curriculum/chemistry/balancing-equations.json",
  "/curriculum/accounting/journal-entries.json"
];

const state: {
  artifacts: Artifact[];
  artifact?: Artifact;
  concept?: Concept;
  item?: PracticeItem;
} = {
  artifacts: []
};

const trackNav = byId("trackNav");
const conceptList = byId("conceptList");
const trackName = byId("trackName");
const conceptTitle = byId("conceptTitle");
const conceptSummary = byId("conceptSummary");
const essaySection = byId("essaySection") as HTMLElement;
const essayTitle = byId("essayTitle");
const essayPlain = byId("essayPlain");
const essayHistory = byId("essayHistory");
const essaySocial = byId("essaySocial");
const essayCare = byId("essayCare");
const objectives = byId("objectives");
const practiceSelect = byId("practiceSelect") as HTMLSelectElement;
const practicePrompt = byId("practicePrompt");
const answerHost = byId("answerHost");
const checkAnswer = byId("checkAnswer") as HTMLButtonElement;
const useSample = byId("useSample") as HTMLButtonElement;
const result = byId("result") as HTMLOutputElement;
const masteryEvidence = byId("masteryEvidence");

void init();

async function init(): Promise<void> {
  state.artifacts = await Promise.all(curriculumFiles.map(loadArtifact));
  renderTrackNav();
  selectTrack(state.artifacts[0].track.id);

  practiceSelect.addEventListener("change", () => {
    if (!state.concept) {
      return;
    }
    const items = allItems(state.concept);
    selectPracticeItem(items[practiceSelect.selectedIndex]);
  });

  checkAnswer.addEventListener("click", () => {
    if (state.item) {
      renderResult(checkResponse(state.item.checker));
    }
  });

  useSample.addEventListener("click", () => {
    if (!state.item) {
      return;
    }
    fillSample(state.item.checker);
  });
}

async function loadArtifact(file: string): Promise<Artifact> {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Could not load ${file}`);
  }
  return (await response.json()) as Artifact;
}

function renderTrackNav(): void {
  trackNav.replaceChildren(
    ...state.artifacts.map((artifact) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = artifact.track.title;
      button.addEventListener("click", () => selectTrack(artifact.track.id));
      return button;
    })
  );
}

function selectTrack(trackId: string): void {
  const artifact = state.artifacts.find((candidate) => candidate.track.id === trackId);
  if (!artifact) {
    return;
  }

  state.artifact = artifact;
  [...trackNav.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-current", button.textContent === artifact.track.title ? "true" : "false");
  });

  conceptList.replaceChildren(
    ...artifact.concepts.map((concept) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = concept.title;
      button.addEventListener("click", () => selectConcept(concept.id));
      item.append(button);
      return item;
    })
  );

  selectConcept(artifact.concepts[0].id);
}

function selectConcept(conceptId: string): void {
  if (!state.artifact) {
    return;
  }

  const concept = state.artifact.concepts.find((candidate) => candidate.id === conceptId);
  if (!concept) {
    return;
  }

  state.concept = concept;
  trackName.textContent = state.artifact.track.title;
  conceptTitle.textContent = concept.title;
  conceptSummary.textContent = concept.summary;
  objectives.replaceChildren(...concept.objectives.map(listItem));
  masteryEvidence.replaceChildren(...concept.masteryCheck.evidenceRequired.map(listItem));
  renderEssay(concept);
  renderPracticeOptions(concept);

  [...conceptList.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-current", button.textContent === concept.title ? "true" : "false");
  });
}

function renderEssay(concept: Concept): void {
  const essay = state.artifact?.orientationEssays.find((candidate) => concept.orientationEssayIds.includes(candidate.id));
  if (!essay) {
    essaySection.hidden = true;
    return;
  }

  essaySection.hidden = false;
  essayTitle.textContent = `${essay.title} (${essay.readingMinutes} min)`;
  essayPlain.textContent = essay.plainLanguageSummary;
  essayHistory.textContent = essay.historicalOrigin;
  essaySocial.textContent = essay.socialImportance;
  essayCare.textContent = essay.whyLearnersCare;
}

function renderPracticeOptions(concept: Concept): void {
  const items = allItems(concept);
  practiceSelect.replaceChildren(
    ...items.map((item, index) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${index + 1}. ${labelForChecker(item.checker)}`;
      return option;
    })
  );
  selectPracticeItem(items[0]);
}

function selectPracticeItem(item: PracticeItem): void {
  state.item = item;
  practicePrompt.textContent = item.prompt;
  result.textContent = "";
  result.className = "result";
  answerHost.replaceChildren(createAnswerInput(item.checker));
}

function createAnswerInput(spec: CheckerSpec): HTMLElement {
  if (spec.kind === "accounting.journal_entry") {
    const textarea = document.createElement("textarea");
    textarea.id = "answer";
    textarea.spellcheck = false;
    textarea.value = JSON.stringify(spec.sampleCorrect, null, 2);
    return textarea;
  }

  const input = document.createElement("input");
  input.id = "answer";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.value = spec.kind === "algebra.expression_simplification" ? spec.expectedExpression : spec.sampleCorrect;
  return input;
}

function checkResponse(spec: CheckerSpec): { correct: boolean; message: string } {
  const answer = byId("answer") as HTMLInputElement | HTMLTextAreaElement;

  switch (spec.kind) {
    case "algebra.expression_simplification":
      return checkAlgebraSimplification({
        originalExpression: spec.originalExpression,
        expectedExpression: spec.expectedExpression,
        response: answer.value
      });
    case "chemistry.equation_balance":
      return checkChemistryBalance({
        skeletonEquation: spec.skeletonEquation,
        response: answer.value
      });
    case "accounting.journal_entry":
      try {
        return checkAccountingEntry({
          expectedLines: spec.expectedLines,
          responseLines: JSON.parse(answer.value) as AccountingLine[]
        });
      } catch {
        return {
          correct: false,
          message: "Journal entry answers must be valid JSON lines."
        };
      }
  }
}

function fillSample(spec: CheckerSpec): void {
  const answer = byId("answer") as HTMLInputElement | HTMLTextAreaElement;
  if (spec.kind === "accounting.journal_entry") {
    answer.value = JSON.stringify(spec.sampleCorrect, null, 2);
    return;
  }
  answer.value = spec.sampleCorrect;
}

function renderResult(check: { correct: boolean; message: string }): void {
  result.textContent = check.message;
  result.className = `result ${check.correct ? "correct" : "incorrect"}`;
}

function allItems(concept: Concept): PracticeItem[] {
  return [...concept.diagnostics, ...concept.practice, ...concept.masteryCheck.items];
}

function labelForChecker(spec: CheckerSpec): string {
  switch (spec.kind) {
    case "algebra.expression_simplification":
      return "Simplify";
    case "chemistry.equation_balance":
      return "Balance";
    case "accounting.journal_entry":
      return "Journal";
  }
}

function listItem(text: string): HTMLLIElement {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element;
}
