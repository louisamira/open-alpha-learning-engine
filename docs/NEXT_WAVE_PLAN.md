# Next Wave Plan

This is the tight next wave of work for Open Alpha Learning Engine. The aim is to make the current reference UI and curriculum graph feel substantially more real without adding platform weight, auth, accounts, deployment complexity, or a heavy frontend stack.

## Constraints

- Keep the app Wikipedia-fast: static-first, text-first, minimal JavaScript.
- Keep curriculum graph artifacts reviewed and version-controlled.
- Prefer deterministic checkers over vague free-response grading.
- Make contribution paths visible before building contributor infrastructure.
- Keep the next wave small enough to review as one coherent product step.

## Mini Features

### 1. Accounting Landing View

Add a real subject landing state for `Accounting` before auto-entering `Accounting 101`.

The landing view should show:

- Accounting 101, 201, and 301 as a visible sequence
- Status for each course: active, draft, or seed
- Expected time budget per course
- One-sentence mastery target per course
- What each course unlocks

Why it matters: Accounting is now an umbrella bucket. A learner should understand the course sequence before being dropped into the first concept.

### 2. Course Map Rail

Replace the plain concept list with a compact course map.

The map should show:

- Concept order
- Prerequisite relationship where useful
- Draft or active status
- Count of diagnostics, practice items, and mastery checks

Why it matters: The durable asset is the graph. The UI should expose graph shape, not hide it behind a generic list.

### 3. Edit This Node Links

Add lightweight contributor links near each concept and orientation essay.

The link should expose:

- Concept ID or essay ID
- Source JSON artifact path
- A GitHub edit or issue URL when possible

Why it matters: The Wikipedia-style contribution model becomes concrete when every node has an obvious revision path.

### 4. Finish Accounting 101 Spine

Add the missing Accounting 101 concepts from the scope doc:

- Debits and credits
- Ledger posting
- Trial balance
- First financial statements
- Final tiny-business bookkeeping task

Where possible, use deterministic checks for journal entries, account classification, and trial-balance equality.

Why it matters: Accounting 101 should become the first complete course because it has a clear practical payoff and strong deterministic-checking surface.

### 5. Algebra Equation Checker Slice

Add the next Algebra 1 vertical slice after expression simplification:

- One-step equations
- Two-step equations
- Equations with variables on one side
- Deterministic solution checking
- Common misconception remediation for inverse-operation and sign errors

Why it matters: Algebra needs to move from symbolic simplification into solving, but without broadening the app too quickly.

## Review Questions

- Is the accounting landing view enough, or should every subject have a landing page from the start?
- Should draft courses be visible to learners by default, or only in contributor/review mode?
- Should edit links go directly to GitHub edit URLs, or should they create prefilled issues first?
- Should Accounting 101 completion be prioritized over adding any more Algebra 1 units?

## Proposed Order

1. Accounting landing view
2. Course map rail
3. Edit this node links
4. Finish Accounting 101 spine
5. Algebra equation checker slice
