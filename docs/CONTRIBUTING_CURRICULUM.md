# Contributing Curriculum

Open Alpha should become editable in the spirit of Wikipedia: many people and agents can improve the graph, but changes are reviewed, sourced, reversible, and validated before learners depend on them.

## Contribution Model

Curriculum contributions should be small pull requests that change reviewed artifacts under `curriculum/` or supporting schemas and checkers under `src/`.

Good contribution types:

- Add a concept node
- Improve an orientation essay
- Add deterministic practice
- Add misconception and remediation coverage
- Correct an inaccurate source note or explanation
- Add a checker for a domain where deterministic validation is possible
- Split a concept that has become too broad
- Improve graph prerequisites

Avoid:

- Unsourced factual claims
- Generated lessons added without review
- Large rewrites that mix content, schema, and UI changes
- Marketing copy inside curriculum artifacts
- Practice items whose answers cannot be checked or reviewed

## Review Expectations

Every curriculum pull request should answer:

- What learner problem does this change solve?
- Which concept IDs changed?
- What source or reasoning supports the change?
- Which misconception, diagnostic, practice, or mastery evidence improved?
- Did `npm run validate` pass?

## Artifact Status

`curriculum/manifest.json` controls what appears in the reference browser UI. It is organized as top-level subject groups, with one or more course artifacts nested under each group.

- `active`: ready to show as part of the main learning path
- `draft`: visible, but still incomplete
- `seed`: early vertical-slice proof or placeholder

Status is not a trust guarantee. It is a signal for learners, contributors, and agents.

## Revision Philosophy

The graph should preserve a clear review trail. If a learner or contributor finds a better explanation, a more accurate prerequisite, or a cleaner practice item, the right path is a focused patch with validation and review.

Over time, the project should add:

- Per-node revision history
- Review comments attached to concept IDs
- Contributor reputation from accepted improvements
- Automated gap queues from validator failures
- Source-quality checks for historical and factual claims
- Outcome monitoring when a curriculum change affects learner performance
