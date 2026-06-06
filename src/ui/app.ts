import { checkAccountingEntry } from "../checkers/accounting-entry.js";
import { checkAlgebraSimplification } from "../checkers/algebra-expression.js";
import { checkChemistryBalance } from "../checkers/chemistry-balancing.js";
import { checkExactAnswer } from "../checkers/index.js";
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

type CurriculumManifest = {
  groups: CourseGroup[];
};

type CourseGroup = {
  id: string;
  title: string;
  summary: string;
  courses: CourseEntry[];
};

type CourseEntry = {
    path: string;
    status: "seed" | "active" | "draft";
    artifact?: Artifact;
};

const state: {
  groups: CourseGroup[];
  group?: CourseGroup;
  artifact?: Artifact;
  course?: CourseEntry;
  concept?: Concept;
  item?: PracticeItem;
} = {
  groups: []
};

const trackNav = byId("trackNav");
const conceptList = byId("conceptList");
const groupName = byId("groupName");
const conceptTitle = byId("conceptTitle");
const conceptSummary = byId("conceptSummary");
const courseSwitcher = byId("courseSwitcher") as HTMLElement;
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
  const manifest = await loadManifest();
  state.groups = await Promise.all(
    manifest.groups.map(async (group) => ({
      ...group,
      courses: await Promise.all(
        group.courses.map(async (course) => ({
          ...course,
          artifact: await loadArtifact(course.path)
        }))
      )
    }))
  );
  renderTrackNav();
  selectGroup(state.groups[0].id);

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

async function loadManifest(): Promise<CurriculumManifest> {
  const response = await fetch("/curriculum/manifest.json");
  if (!response.ok) {
    throw new Error("Could not load curriculum manifest.");
  }
  return (await response.json()) as CurriculumManifest;
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
    ...state.groups.map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = group.title;
      button.addEventListener("click", () => selectGroup(group.id));
      return button;
    })
  );
}

function selectGroup(groupId: string): void {
  const group = state.groups.find((candidate) => candidate.id === groupId);
  if (!group) {
    return;
  }

  state.group = group;
  [...trackNav.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-current", button.textContent === group.title ? "true" : "false");
  });

  renderCourseSwitcher(group);
  selectCourse(group.courses[0].path);
}

function renderCourseSwitcher(group: CourseGroup): void {
  if (group.courses.length <= 1) {
    courseSwitcher.hidden = true;
    courseSwitcher.replaceChildren();
    return;
  }

  courseSwitcher.hidden = false;
  courseSwitcher.replaceChildren(
    ...group.courses.map((course) => {
      const button = document.createElement("button");
      button.type = "button";
      const title = course.artifact?.track.title ?? course.path;
      button.setAttribute("aria-label", `${title} ${course.status}`);
      button.append(document.createTextNode(title));
      const status = document.createElement("span");
      status.className = "status";
      status.textContent = course.status;
      button.append(document.createTextNode(" "));
      button.append(status);
      button.addEventListener("click", () => selectCourse(course.path));
      return button;
    })
  );
}

function selectCourse(coursePath: string): void {
  const course = state.group?.courses.find((candidate) => candidate.path === coursePath);
  const artifact = course?.artifact;
  if (!course || !artifact) {
    return;
  }

  state.course = course;
  state.artifact = artifact;

  [...courseSwitcher.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-current", button.textContent?.includes(artifact.track.title) ? "true" : "false");
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
  groupName.textContent = courseLabel();
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

function courseLabel(): string {
  if (!state.group || !state.artifact) {
    return "";
  }

  return state.group.courses.length > 1
    ? `${state.group.title} / ${state.artifact.track.title}`
    : state.group.title;
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
  if (spec.kind === "algebra.expression_simplification") {
    input.value = spec.expectedExpression;
  } else if (spec.kind === "conceptual.exact_answer") {
    input.value = spec.sampleCorrect;
  } else {
    input.value = spec.sampleCorrect;
  }
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
    case "conceptual.exact_answer":
      return checkExactAnswer({
        expectedAnswers: spec.expectedAnswers,
        response: answer.value,
        caseSensitive: spec.caseSensitive
      });
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
    case "conceptual.exact_answer":
      return "Classify";
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
