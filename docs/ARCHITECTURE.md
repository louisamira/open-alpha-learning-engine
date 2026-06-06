# Architecture

Open Alpha is organized around a reviewed curriculum graph plus deterministic evaluation tools. The web app is one possible surface, not the durable asset.

## Core Modules

### Curriculum Graph

Curriculum lives as JSON artifacts under `curriculum/`. Each artifact contains:

- Track metadata
- Concept nodes
- Prerequisite edges
- Orientation essays
- Diagnostics
- Practice items
- Mastery checks
- Misconceptions and remediation links
- Source references

The graph validator checks schema validity, duplicate IDs, missing prerequisites, cycles, level inversions, orphaned concepts, missing diagnostics, missing mastery checks, and checker coverage.

### Orientation Essays

Orientation essays are graph artifacts attached to a track, unit, or concept. They answer what the idea is, where it came from, what human problem it solves, why society cares, common objections, and where to go deeper.

### Learner Model

The learner model is typed in `src/domain/learner-model.ts`. It tracks per-concept mastery, confidence, retention risk, misconceptions, attempts, time on task, hint dependency, focus signals, explanation preferences, interests, and prerequisite weakness patterns.

### Checkers

Checkers live in `src/checkers/` and are deterministic by default:

- Algebra expression equivalence and simplification checks
- Chemistry equation balance checks
- Accounting debit and credit journal-entry checks

The first validation command exercises these checkers against seed practice and mastery items.

## Non-Goals For This Milestone

- No auth
- No payments
- No deployment layer
- No parent dashboards
- No marketing landing page
- No copied Express or Vercel backend from the old prototype

## Extension Path

The next layer should add a lesson renderer grounded in reviewed concept nodes, then an assessment engine that updates the learner model after each attempt. Agent contributions should enter through schema-validated JSON proposals and deterministic checker tests before review.
