import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { curriculumArtifactSchema, type CheckerSpec, type ConceptNode, type CurriculumArtifact } from "../src/domain/curriculum-graph.js";
import { runSampleChecks } from "../src/checkers/index.js";

type ValidationIssue = {
  file: string;
  message: string;
};

const curriculumRoot = path.resolve("curriculum");

const curriculumManifestSchema = z.object({
  schemaVersion: z.literal("0.1"),
  groups: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    courses: z.array(z.object({
      path: z.string().startsWith("/curriculum/"),
      status: z.enum(["seed", "active", "draft"])
    })).min(1)
  })).min(1)
});

async function main(): Promise<void> {
  const files = await findJsonFiles(curriculumRoot);
  const issues: ValidationIssue[] = [];
  let checkerCount = 0;
  let manifestCount = 0;

  if (files.length === 0) {
    issues.push({ file: "curriculum", message: "No curriculum JSON files found." });
  }

  for (const file of files) {
    if (path.basename(file) === "manifest.json") {
      await validateManifest(file, issues);
      manifestCount += 1;
      continue;
    }

    const artifact = await parseArtifact(file, issues);
    if (!artifact) {
      continue;
    }

    issues.push(...validateGraph(file, artifact));

    for (const spec of collectCheckerSpecs(artifact)) {
      checkerCount += 1;
      const result = runSampleChecks(spec);
      if (!result.correct.correct) {
        issues.push({
          file,
          message: `Checker ${spec.kind} rejected its sampleCorrect: ${result.correct.message}`
        });
      }
      if (result.incorrect.correct) {
        issues.push({
          file,
          message: `Checker ${spec.kind} accepted its sampleIncorrect.`
        });
      }
    }
  }

  if (issues.length > 0) {
    console.error("Curriculum validation failed:");
    for (const issue of issues) {
      console.error(`- ${path.relative(process.cwd(), issue.file)}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${files.length - manifestCount} curriculum files, ${manifestCount} manifest, and exercised ${checkerCount} checker specs.`);
}

async function parseArtifact(file: string, issues: ValidationIssue[]): Promise<CurriculumArtifact | undefined> {
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
    const parsed = curriculumArtifactSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          file,
          message: `${issue.path.join(".") || "root"}: ${issue.message}`
        });
      }
      return undefined;
    }
    return parsed.data;
  } catch (error) {
    issues.push({
      file,
      message: error instanceof Error ? error.message : "Could not parse JSON."
    });
    return undefined;
  }
}

async function validateManifest(file: string, issues: ValidationIssue[]): Promise<void> {
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
    const parsed = curriculumManifestSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          file,
          message: `${issue.path.join(".") || "root"}: ${issue.message}`
        });
      }
      return;
    }

    const seenGroups = new Set<string>();
    const seenArtifacts = new Set<string>();
    for (const group of parsed.data.groups) {
      if (seenGroups.has(group.id)) {
        issues.push({ file, message: `Duplicate manifest group ${group.id}.` });
      }
      seenGroups.add(group.id);

      for (const artifact of group.courses) {
        if (seenArtifacts.has(artifact.path)) {
          issues.push({ file, message: `Duplicate manifest artifact ${artifact.path}.` });
        }
        seenArtifacts.add(artifact.path);

        const artifactPath = path.join(process.cwd(), artifact.path);
        try {
          await readFile(artifactPath, "utf8");
        } catch {
          issues.push({ file, message: `Manifest references missing artifact ${artifact.path}.` });
        }
      }
    }
  } catch (error) {
    issues.push({
      file,
      message: error instanceof Error ? error.message : "Could not parse manifest JSON."
    });
  }
}

async function findJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findJsonFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [fullPath] : [];
    })
  );

  return files.flat().sort();
}

function validateGraph(file: string, artifact: CurriculumArtifact): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const conceptById = new Map<string, ConceptNode>();
  const essayIds = new Set(artifact.orientationEssays.map((essay) => essay.id));
  const dependents = new Map<string, string[]>();

  for (const concept of artifact.concepts) {
    if (concept.trackId !== artifact.track.id) {
      issues.push({ file, message: `${concept.id} trackId does not match artifact track id.` });
    }

    if (conceptById.has(concept.id)) {
      issues.push({ file, message: `Duplicate concept id ${concept.id}.` });
    }
    conceptById.set(concept.id, concept);

    for (const essayId of concept.orientationEssayIds) {
      if (!essayIds.has(essayId)) {
        issues.push({ file, message: `${concept.id} references missing orientation essay ${essayId}.` });
      }
    }
  }

  for (const essay of artifact.orientationEssays) {
    const targetExists = essay.targetId === artifact.track.id || conceptById.has(essay.targetId);
    if (!targetExists) {
      issues.push({ file, message: `Orientation essay ${essay.id} targets missing graph node ${essay.targetId}.` });
    }
  }

  for (const concept of artifact.concepts) {
    for (const prerequisiteId of concept.prerequisites) {
      const prerequisite = conceptById.get(prerequisiteId);
      if (!prerequisite) {
        issues.push({ file, message: `${concept.id} references missing prerequisite ${prerequisiteId}.` });
        continue;
      }

      if (prerequisite.level > concept.level) {
        issues.push({
          file,
          message: `${concept.id} has prerequisite ${prerequisiteId} at a higher level.`
        });
      }

      dependents.set(prerequisiteId, [...(dependents.get(prerequisiteId) ?? []), concept.id]);
    }

    if (concept.diagnostics.length === 0) {
      issues.push({ file, message: `${concept.id} has no diagnostics.` });
    }

    if (concept.masteryCheck.items.length === 0) {
      issues.push({ file, message: `${concept.id} has no mastery check items.` });
    }

    const misconceptionIds = new Set(concept.misconceptions.map((misconception) => misconception.id));
    for (const probe of concept.diagnostics) {
      for (const misconceptionId of probe.misconceptionIds) {
        if (!misconceptionIds.has(misconceptionId)) {
          issues.push({
            file,
            message: `${probe.id} references missing misconception ${misconceptionId} on ${concept.id}.`
          });
        }
      }
    }
  }

  issues.push(...validateAcyclic(file, artifact.concepts));

  const roots = artifact.concepts.filter((concept) => concept.prerequisites.length === 0);
  const reachable = reachableConceptIds(roots, dependents);
  for (const concept of artifact.concepts) {
    if (!reachable.has(concept.id)) {
      issues.push({ file, message: `${concept.id} is not reachable from a root concept.` });
    }
  }

  return issues;
}

function validateAcyclic(file: string, concepts: ConceptNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(conceptId: string, pathSoFar: string[]): void {
    if (visiting.has(conceptId)) {
      issues.push({ file, message: `Cycle detected: ${[...pathSoFar, conceptId].join(" -> ")}.` });
      return;
    }
    if (visited.has(conceptId)) {
      return;
    }

    const concept = conceptById.get(conceptId);
    if (!concept) {
      return;
    }

    visiting.add(conceptId);
    for (const prerequisiteId of concept.prerequisites) {
      visit(prerequisiteId, [...pathSoFar, conceptId]);
    }
    visiting.delete(conceptId);
    visited.add(conceptId);
  }

  for (const concept of concepts) {
    visit(concept.id, []);
  }

  return issues;
}

function reachableConceptIds(roots: ConceptNode[], dependents: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>();
  const stack = roots.map((concept) => concept.id);

  while (stack.length > 0) {
    const conceptId = stack.pop();
    if (!conceptId || reachable.has(conceptId)) {
      continue;
    }

    reachable.add(conceptId);
    stack.push(...(dependents.get(conceptId) ?? []));
  }

  return reachable;
}

function collectCheckerSpecs(artifact: CurriculumArtifact): CheckerSpec[] {
  return artifact.concepts.flatMap((concept) => [
    ...concept.diagnostics.map((diagnostic) => diagnostic.checker),
    ...concept.practice.map((practice) => practice.checker),
    ...concept.masteryCheck.items.map((item) => item.checker)
  ]);
}

void main();
