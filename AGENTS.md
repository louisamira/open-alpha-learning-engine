# Open Alpha Learning Engine Agent Notes

Open Alpha is a graph-first adaptive learning engine. Treat reviewed curriculum JSON and deterministic checkers as core product assets.

## Working Rules

- Keep curriculum artifacts under `curriculum/` in version control.
- Add browser-visible curriculum artifacts to `curriculum/manifest.json`.
- Keep orientation essays as first-class graph artifacts, not blog or marketing content.
- Prefer deterministic checkers for practice and mastery whenever a domain permits it.
- Do not build auth, payments, deployment, parent dashboards, or marketing pages in the first milestones.
- Do not copy the old prototype backend wholesale. Use it only as reference for ideas.
- Run `npm run validate` after changing curriculum, schemas, or checkers.

## Current Vertical Slices

- Algebra 1: expressions and simplifying
- Chemistry: balancing chemical equations
- Accounting: accounting equation and journal entries
