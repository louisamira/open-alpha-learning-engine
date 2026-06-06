# Open Alpha Refactor Seed Plan

## Core Thesis

Open Alpha should become an open-source, self-improving adaptive learning engine. The durable asset is not a web app, a lesson library, or a chatbot. The durable asset is a validated concept graph plus a learner model, assessment engine, generation/review pipeline, and reference learning surfaces.

Alpha School and TimeBack are useful directional references: focused mastery blocks, personalized pacing, real-time study coaching, progress analytics, and the emotional promise that serious focus earns the learner time back. Open Alpha should copy the good pattern, not the proprietary model: open graph, transparent pedagogy, agent-contributed improvements, and local/self-hostable economics.

## Initial Tracks

Start with three serious tracks:

1. Algebra 1
2. Chemistry
3. Accounting

Algebra 1 is the anchor because it has a clear prerequisite structure, high demand, measurable exercises, and is already partly enriched in the current repo. Chemistry adds science with visual/conceptual models, safety around factual accuracy, and strong prerequisite dependencies. Accounting adds adult/business learning, practical examples, and a clean concept chain that can prove the model works beyond K-12.

## Product Shape

The first version should feel like a focused mastery cockpit, not a general content site.

Each learner gets:

- A diagnostic starting point for each track.
- A daily focused learning block with a target time budget.
- A ranked "next best concept" queue.
- A lesson generated from reviewed source material.
- A tutor grounded in that concept's source of truth.
- Practice that adapts after each attempt.
- A mastery check with evidence, not just completion.
- Review prompts for retention.
- A timeback/focus dashboard that rewards efficient, honest study.

Each contributor or agent gets:

- A public graph endpoint.
- A ranked gap queue.
- Schemas for concepts, exercises, diagnostics, misconceptions, and lesson modules.
- Automated validation before review.
- A review queue with clear accept/reject/improve decisions.
- Reputation based on accepted contributions and downstream learner outcomes.

## Social and Elementary Grounding

The engine should not start with drills. It should start with meaning.

Every track, unit, and major concept should have an optional 3-4 minute orientation essay that answers:

- What is this subject or idea, in plain language?
- Where did it come from historically?
- What human problem was it invented to solve?
- Why does society still care about it?
- What changes when you understand it?
- What can you safely ignore for now?
- How does this connect to the next thing you will learn?

These essays should feel more like a thoughtful explainer than a textbook section. They should be short enough to read before a lesson, but expandable into deeper historical, social, technical, and career-oriented layers.

This is especially important for elementary grounding. A learner should be able to ask, "Why am I learning this?" and get an answer that is not fake. Algebra is not "because it is on the test." Chemistry is not "because atoms are in the curriculum." Accounting is not "because businesses need spreadsheets." Each subject is a human technology for seeing something that used to be hidden.

### Orientation Essay Types

- Track essay: "What is Algebra 1?" or "What is Chemistry?"
- Unit essay: "Why do equations matter?" or "Why did the periodic table change science?"
- Concept essay: "Why does balancing chemical equations matter?"
- Social essay: "Who uses this in the real world, and how?"
- History essay: "Who invented this, and what problem were they solving?"
- Elementary analogy: "Explain the whole idea to a curious 10-year-old."
- Deep dive: "Go much deeper if I want the full story."

### Essay Data Shape

Orientation essays should be part of the graph, not loose blog content.

Each essay should store:

- `scope`: track, unit, or concept
- `readingMinutes`: usually 3-4
- `plainLanguageSummary`
- `historicalOrigin`
- `socialImportance`
- `whyLearnersCare`
- `commonObjections`
- `deeperPaths`
- `sourceNotes`

Agents can contribute these essays too, but they should go through review like lesson content. The quality bar is different from a generated drill: accuracy matters, but taste and usefulness matter too.

## Track Scope

### Algebra 1

Goal: A complete, high-quality Algebra 1 path that could plausibly replace a conventional first-year algebra course.

Orientation essay seed:

"What is Algebra 1?" should explain algebra as the language of unknowns and relationships. It grew from practical problems in trade, inheritance, surveying, astronomy, and engineering: how do you solve for a missing quantity when you know some constraints? The word algebra comes through Arabic mathematical traditions, especially al-jabr, meaning something like restoration or completion. Socially, algebra matters because modern life is full of hidden variables: prices, rates, loans, growth, risk, motion, and code. Algebra gives learners a way to stop guessing and start representing.

Elementary grounding:

Before symbols become formal, algebra should feel like puzzle solving. "A number plus 7 equals 12" is not scary; it is a missing-piece problem. The symbols are just a compact way to keep track of the missing piece.

Core graph areas:

- Real numbers and properties
- Expressions and simplification
- One-step, two-step, and multi-step equations
- Inequalities
- Linear functions
- Slope and graphing
- Systems of equations
- Exponents and radicals
- Polynomials
- Factoring
- Quadratics
- Intro statistics and scatter plots

High-leverage improvements:

- Add diagnostic probes for every major unit.
- Add misconception maps, e.g. sign errors, distributing incorrectly, combining unlike terms.
- Add symbolic answer checking instead of relying on multiple choice.
- Add generated variants of practice problems with known solution steps.
- Add spaced review based on forgotten prerequisite patterns.

### Chemistry

Goal: A conceptual and quantitative chemistry path from atoms through reactions, suitable for late middle school through intro high school chemistry.

Orientation essay seed:

"What is Chemistry?" should explain chemistry as the study of what things are made of and how they change. It begins with very old human practices: fire, cooking, dyes, metals, medicines, fermentation, glass, and pottery. Over time, people moved from recipes and alchemy toward measurement, atoms, elements, and reactions. Socially, chemistry matters because it sits underneath food, medicine, climate, energy, batteries, materials, agriculture, and pollution. Chemistry lets a learner see that the world is not just stuff. It is stuff transforming.

Elementary grounding:

Chemistry can begin with the question, "What happens when something changes?" Ice melts. Bread rises. Iron rusts. Wood burns. Vinegar and baking soda fizz. The first lesson is not formulas; it is noticing that matter has patterns.

Core graph areas:

- Matter and measurement
- Atoms and elements
- Periodic table
- Molecules and compounds
- Chemical bonds
- Conservation of mass
- Chemical equations
- Balancing reactions
- Moles and molar mass
- Stoichiometry
- Acids and bases
- Energy in reactions

High-leverage improvements:

- Structured visual payloads for atoms, bonds, molecules, and reactions.
- Equation balancing engine or deterministic checker.
- Unit conversion practice with dimensional analysis.
- Misconception maps, e.g. atoms disappearing in reactions, subscripts vs coefficients.
- Safety/factuality evals for generated chemistry content.

### Accounting

Goal: A practical accounting and bookkeeping path for adults, founders, operators, and students.

Orientation essay seed:

"What is Accounting?" should explain accounting as a social technology for trust. Long before modern companies, people needed records: who owed grain, who paid taxes, what a temple stored, what a merchant shipped, what a household could afford. Accounting turns messy economic activity into shared evidence. Socially, it matters because money without records becomes rumor. Businesses, governments, investors, nonprofits, and families all need a way to know what happened and what is true enough to act on.

Elementary grounding:

Accounting can begin with a lemonade stand. You started with cash, bought lemons and sugar, sold cups, paid a helper, and ended with some money left. Did you make a profit? Do you still owe anyone? What do you own now? Accounting is the habit of answering those questions honestly.

Core graph areas:

- What accounting is for
- Accounting equation
- Debits and credits
- Chart of accounts
- Journal entries
- General ledger
- Trial balance
- Income statement
- Balance sheet
- Cash flow statement
- Accrual vs cash accounting
- Adjusting entries

High-leverage improvements:

- Transaction simulator: learner records journal entries and sees statements update.
- Deterministic debit/credit balancing checker.
- Scenario-based practice for businesses, households, and startups.
- Misconception maps, e.g. debit means bad, revenue equals cash, profit equals cash.
- Real-world mini-project: build books for a tiny fictional company.

## Engine Modules

### 1. Curriculum Graph

The graph should store concepts, prerequisites, level, track, objectives, standards, orientation essays, misconceptions, diagnostic probes, practice generators, mastery criteria, and source references.

The graph validator should check:

- Missing prerequisites
- Cycles
- Level inversions
- Orphan concepts
- Concepts without diagnostics
- Concepts without mastery checks
- Misconceptions with no remediation path
- Tracks with dead ends

### 2. Learner Model

Move beyond "mastery_score = latest quiz score." Track:

- Per-concept mastery estimate
- Confidence
- Retention risk
- Misconceptions observed
- Attempts and time-on-task
- Hint dependency
- Rapid guessing/focus signals
- Preferred explanation style
- Interest profile
- Prerequisite weakness patterns

### 3. Lesson Renderer

Keep lessons generated, but ground them in reviewed artifacts.

Inputs:

- Concept node
- Learner model
- Selected explanation depth
- Interests
- Misconceptions to avoid or address
- Required practice style

Outputs:

- Lesson text
- Worked examples
- Visual payload
- Practice set
- Check-for-understanding question
- Remediation suggestion

### 4. Assessment Engine

Assessment should become the core differentiator.

Use:

- Diagnostic probes before placement
- Formative checks during lessons
- Deterministic checkers where possible
- Multiple generated variants per skill
- Mastery checks with rubric/evidence
- Retention review after time passes

### 5. Timeback Coach

Borrow the best TimeBack pattern: visible efficiency and focus feedback.

Track:

- Focused minutes
- Concept progress per minute
- Rapid guesses
- Idle periods
- Hint overuse
- Accuracy trend
- Review debt
- Time earned back

The coach should not shame the learner. It should make tradeoffs visible: "You are guessing quickly; slow down for two questions and your session will finish faster."

### 6. Agent Contribution System

Assume others contribute time and tokens.

Agent queues:

- Missing concept metadata
- Weak prerequisite chains
- Missing diagnostic probes
- Missing practice generators
- Missing misconception mappings
- Weak lesson modules
- Failed validator checks
- Learner sessions where many students stall

Review gates:

- Schema validation
- Subject-specific deterministic checks
- LLM critique
- Human/agent peer review
- Deployment only after approval
- Outcome monitoring after deployment

## First Milestone

Build a new project around one complete vertical slice:

1. Algebra 1: expressions and simplifying
2. Chemistry: balancing chemical equations
3. Accounting: accounting equation and journal entries

For each vertical slice, ship:

- Validated graph nodes
- Diagnostic probe
- Lesson renderer
- Interactive practice/checker
- Tutor chat grounded in source material
- Mastery check
- Misconception-specific remediation
- Timeback/focus instrumentation
- Contribution schema and review path

This is enough to prove whether the system can produce genuinely adaptive tutoring rather than another lesson site.

## Non-Goals For The First Refactor

- Do not expand to dozens of subjects.
- Do not optimize the landing page.
- Do not build parent dashboards first.
- Do not rely on pure multiple choice for mastery.
- Do not let generated content go directly to learners without review or strong evals.
- Do not keep both Express and Vercel backends.

## Immediate Repo Actions

1. Create a new repo dedicated to the learning engine.
2. Copy only the useful source: curriculum JSON, validator ideas, lesson generation prompt, tutor prompt, contribution/review APIs, and selected frontend learning components.
3. Leave behind the duplicate Express backend and general marketing surface.
4. Define the new data model before porting UI.
5. Build the three vertical slices before adding any more tracks.
