<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: none (all 16 original principles unchanged)
Added sections:
  - Core Principle XVII (Consolidated Constants Files)
Removed sections: none
Rationale for MINOR bump: new principle added (materially expanded guidance),
no existing principle redefined or removed.
Templates requiring updates:
  - .specify/templates/plan-template.md — ⚠ pending manual review (verify
    Constitution Check gates reference all 17 principles)
  - .specify/templates/spec-template.md — no impact expected (coding-convention
    principle, not spec-level)
  - .specify/templates/tasks-template.md — ⚠ pending manual review (task
    descriptions for new constants should reference the shared constants.ts
    convention where applicable)
Follow-up TODOs: none.
-->

# Heroes Factory Constitution

## Core Principles

### I. Proportional Architecture
The architecture MUST match the actual size and complexity of the application.
Overengineering is a defect: microservices, CQRS, event sourcing, speculative
factories, unnecessary layering, and abstractions without a concrete, present
need are FORBIDDEN. Every structural decision must be justifiable by a problem
that exists today, not one that might exist later.
**Rationale**: This is a small full-stack technical assessment; complexity
that outpaces the problem obscures the engineering judgment being evaluated
and slows delivery without adding value.

### II. TypeScript Strict Mode
TypeScript strict mode MUST be enabled and enforced across both frontend and
backend. `any`, implicit `any`, and type-suppression comments (e.g.
`@ts-ignore`) MUST NOT be used to bypass legitimate type errors.
**Rationale**: Strict typing catches correctness issues at compile time and
keeps the codebase self-documenting, which is essential when the code itself
is the primary artifact under review.

### III. Pragmatic SOLID
SOLID principles MUST be applied pragmatically, not dogmatically. A design
pattern or abstraction is only justified when it solves a concrete, present
problem in maintainability, testability, or dependency management. Patterns
introduced "for future flexibility" without a current driver are FORBIDDEN.
**Rationale**: Principles serve the code, not the reverse; misapplied SOLID
produces the same overengineering this project explicitly rejects (see
Principle I).

### IV. Layered Separation of Concerns
The codebase MUST maintain clear separation between HTTP transport, business
rules, persistence, and frontend presentation. Business logic MUST NOT live
inside route handlers, controllers, or UI components; transport code MUST NOT
embed persistence queries or business rules directly.
**Rationale**: Clean seams between layers keep each concern independently
testable and let a reviewer trace a request through the system without
untangling responsibilities.

### V. Backend-Enforced Business Rules
All business rules MUST be enforced by the backend. Frontend validation MAY
exist to improve UX but MUST NEVER be the sole enforcement mechanism for any
rule that affects data integrity, authorization, or business correctness.
**Rationale**: Frontend validation is trivially bypassable; correctness and
security guarantees must not depend on client-controlled code.

### VI. Consistent RESTful API Design
The API MUST follow consistent REST conventions: appropriate HTTP methods per
operation, correct status codes, structured request validation, and
predictable, structured error responses.
**Rationale**: A consistent API contract is easier to consume, test, and
reason about, and demonstrates deliberate interface design rather than
ad-hoc endpoints.

### VII. Version-Controlled Schema Migrations
All database schema changes MUST be expressed as version-controlled,
reproducible migrations. Manual, undocumented, or environment-specific schema
edits are FORBIDDEN.
**Rationale**: Migrations make schema evolution auditable and let any
environment be rebuilt deterministically from source control.

### VIII. Risk-Prioritized Automated Testing
Automated tests MUST prioritize, in order of importance: business rules, API
behavior, critical frontend interactions, error states, and state transitions.
Test effort MUST be allocated toward risk and behavior correctness over
incidental coverage (e.g. trivial getters, static markup).
**Rationale**: Limited test-writing time must protect the properties that
matter most — correct business behavior and graceful failure — not chase
coverage metrics.

### IX. Explicit Async UI Feedback
Every asynchronous frontend operation MUST expose an appropriate loading
state and MUST communicate success or failure to the user.
**Rationale**: Silent or ambiguous async operations degrade perceived
reliability and hide failures that the user needs to know about.

### X. Readable Over Clever Code
Code MUST favor readability and explicitness over cleverness or premature
generalization. When a simple, direct implementation and a more abstract or
"elegant" one both solve the problem, the simple one MUST be chosen unless
the abstraction is justified by a concrete, present need (see Principle I).
**Rationale**: Readable code is faster to review, debug, and defend in a
technical discussion — a direct goal of this project.

### XI. Intentional Dependencies
Every third-party dependency MUST be introduced for a concrete, articulable
benefit. Dependencies added out of habit, convenience without justification,
or to avoid writing a small amount of code MUST NOT be added.
**Rationale**: Each dependency is a maintenance, security, and cognitive-load
cost; unnecessary ones undermine the proportionality principle (Principle I).

### XII. No Committed Secrets
Secrets and environment-specific configuration MUST NOT be committed to
source control. Where environment configuration is required, an example
environment file (e.g. `.env.example`) MUST be provided and kept in sync with
actual required variables.
**Rationale**: Committed secrets are a security liability and an example file
lets any developer or reviewer reproduce the environment safely.

### XIII. Reproducible Local Development
Local development setup MUST be reproducible through documented commands and
Docker-based database infrastructure. A new contributor MUST be able to reach
a running local environment by following documented steps alone.
**Rationale**: Reproducibility removes "works on my machine" ambiguity and is
itself part of what is being assessed.

### XIV. English-Only Artifacts
Code, identifiers, filenames, commit messages, API contracts, and technical
documentation MUST be written in English.
**Rationale**: A single working language keeps the codebase consistent and
accessible to any reviewer or future contributor.

### XV. Practical Accessibility
Accessibility MUST be considered for interactive elements: forms, dialogs,
menus, switches, loading indicators, and feedback messages. This includes,
at minimum, keyboard operability, appropriate semantic markup or ARIA
attributes, and visible state/feedback communication.
**Rationale**: Accessibility is a baseline quality attribute of production
-grade frontend work, not an optional enhancement.

### XVI. Defensible Architectural Decisions
Every significant architectural decision MUST be understandable and
defensible in a technical interview setting: the author must be able to
articulate the problem it solves and the trade-offs considered.
**Rationale**: This project exists to demonstrate engineering judgment;
decisions that cannot be explained and justified undermine that purpose.

### XVII. Consolidated Constants Files
Constants scoped to a component, feature, or folder MUST live in a single
shared `constants.ts` file within that folder, imported by whichever files
need them. Creating a new file named after an individual constant (e.g. a
`menuItemHeight.ts` holding only `MENU_ITEM_HEIGHT`) is FORBIDDEN — related
constants for that folder MUST be grouped into the one `constants.ts`
instead, even if it currently holds a single value.
**Rationale**: A predictable, singular location for a folder's constants is
faster to find and extend than a proliferating set of one-export files, and
avoids the file-per-symbol sprawl that undermines Principle X (Readable Over
Clever Code) and Principle I (Proportional Architecture).

## Technology & Environment Constraints

The backend and frontend MUST both use TypeScript in strict mode (Principle
II). Persistent storage MUST run via Docker-based infrastructure for local
development (Principle XIII), with schema managed exclusively through
version-controlled migrations (Principle VII). Environment-specific values
MUST be supplied via environment variables, never hard-coded, with an example
environment file kept current (Principle XII).

## Development Workflow & Quality Gates

Before a change is considered complete: type checks MUST pass in strict mode,
automated tests covering the change's business rules and API behavior MUST
pass, and any new or modified schema change MUST be accompanied by a
migration. Code review (self-review when working solo) MUST verify
compliance with the Core Principles above, in particular that no
unjustified abstraction, dependency, or architectural layer has been
introduced (Principles I, III, XI).

## Governance

This constitution supersedes all other informal practices for this project.
Amendments require the change to be written into this document, the version
incremented per the policy below, and the Sync Impact Report updated to
reflect what changed and why.

**Versioning policy**: MAJOR for backward-incompatible principle removals or
redefinitions; MINOR for new principles or materially expanded guidance;
PATCH for clarifications and non-semantic wording fixes.

**Compliance review**: Any plan, spec, or task generated for this project
MUST be checked against these principles before implementation begins, and
any deviation MUST be explicitly justified in the relevant artifact (e.g. a
plan's Complexity Tracking section) rather than silently introduced.

**Version**: 1.1.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-14
