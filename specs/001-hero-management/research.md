# Phase 0 Research: Hero Management

All Technical Context items were fully specified by the user's plan instructions; no
`NEEDS CLARIFICATION` markers remain. This document records the rationale behind each
technology/pattern decision and the alternatives considered, per the constitution's
requirement (Principle XVI) that every architectural decision be defensible.

## Repository & workspace layout

**Decision**: Single repo, npm workspaces, `apps/web` + `apps/api`, no build-system layer
(Turborepo/Nx).

**Rationale**: Two packages with no shared internal library do not need workspace-graph
tooling; npm workspaces alone gives shared root scripts and hoisted installs. Matches
Principle I (proportional architecture).

**Alternatives considered**: Turborepo/Nx (rejected — no build-graph caching value at this
scale, adds a tool to explain without a concrete problem it solves); two separate repos
(rejected — unnecessary coordination overhead for a single small assessment).

## Frontend state management

**Decision**: TanStack Query owns all server state (list, search, mutations, cache
invalidation); local component state (`useState`) owns UI-only state (modal open/closed,
selected hero, pending confirmation). No Redux or other global store.

**Rationale**: The only cross-cutting state is server data; TanStack Query's cache already
serves as the single source of truth for it, so a second global store would duplicate
state and its invalidation rules. Matches the explicit "do not introduce Redux" instruction
and Principle I.

**Alternatives considered**: Redux/Zustand for global UI state (rejected — no concrete
cross-component UI state exists beyond what's local to each dialog); Context API for hero
list (rejected — TanStack Query already provides this without extra plumbing).

## Forms & validation

**Decision**: React Hook Form for form state/submission, Zod for schema validation, wired
via `@hookform/resolvers/zod`. The same conceptual shape (name/nickname/date_of_birth/
universe/main_power/avatar_url) is validated client-side (fast feedback) and re-validated
server-side via NestJS DTOs + class-validator (source of truth, per Principle V).

**Rationale**: RHF minimizes re-renders and integrates cleanly with MUI's controlled
inputs; Zod gives a declarative, typed schema that mirrors what the backend DTOs enforce,
keeping both layers easy to reason about together without sharing runtime code across the
frontend/backend boundary (which would require a shared package — rejected as unnecessary
for six fields).

**Alternatives considered**: Formik (rejected — RHF is lighter and integrates better with
Zod out of the box); uncontrolled native forms only (rejected — would forgo RHF's
validation-state ergonomics needed for FR-019 preserving entered values on failure).

## Backend persistence access

**Decision**: One `HeroesRepository` interface + one `PrismaHeroesRepository`
implementation, injected into `HeroesService`.

**Rationale**: This is the one abstraction the constitution explicitly sanctions
(Principle III) because it has a concrete payoff: `HeroesService`'s business rules (active-
state gating, default-active creation, status-only mutation) can be unit tested with an
in-memory fake repository, without a database. No additional layers (use-case objects,
mappers, gateways) are introduced because nothing in the spec requires them.

**Alternatives considered**: Direct Prisma calls in the service (rejected — makes
business-rule unit tests require a real/mocked Prisma client, coupling tests to ORM
shape); generic repository base class (rejected — one entity does not justify a generic
abstraction over it).

## Avatar URL image verification (FR-025)

**Decision**: On create/edit, the backend performs a `HEAD` (falling back to a limited
`GET`) request to the submitted `avatar_url` and checks the response's `Content-Type`
starts with `image/` and the request succeeds (2xx) within a short timeout (e.g. 5s).
Failure → reject with a validation error identifying the `avatarUrl` field.

**Rationale**: This directly satisfies the clarified FR-025 requirement (verify the URL
resolves to a loadable image before accepting the submission) without introducing an image
storage/proxy subsystem, which is out of scope.

**Alternatives considered**: Format-only regex validation (rejected — explicitly
insufficient per the clarification session); downloading and decoding the full image to
verify pixel data (rejected — unnecessary cost; `Content-Type` + successful fetch is
sufficient signal for this scope); client-side-only `<img onError>` check (rejected —
business rules must be backend-enforced per Principle V / FR constitution).

## API error shape

**Decision**: NestJS's built-in `HttpException` types (`BadRequestException`,
`NotFoundException`, `ConflictException`, `UnprocessableEntityException`) with a global
exception filter producing a consistent JSON body: `{ statusCode, message, error }`
(Nest's default shape), ensuring Prisma/DB errors are caught and translated rather than
leaked.

**Rationale**: Meets FR requirement for consistent, structured error responses (Principle
VI) without inventing a bespoke error envelope; a thin exception filter is enough to
guarantee Prisma error codes (e.g. `P2025` not found) never reach the client raw.

**Alternatives considered**: RFC 7807 Problem+JSON (rejected — adds a format the frontend
gains no concrete benefit from at this scope, though the shape used is compatible with
upgrading later if needed); custom error classes per business rule (rejected — Nest's
built-in exceptions already map 1:1 to the needed status codes: 400 validation, 404 not
found, 409/422 business-rule violation).

## Testing tool choices

**Decision**: Jest for backend unit tests, Supertest for backend HTTP integration tests
(both are NestJS defaults); Vitest + React Testing Library for frontend (Vite-native,
avoids a second bundler/config for tests).

**Rationale**: Matches project's respective toolchains (Nest ships with Jest scaffolding;
Vite pairs naturally with Vitest), minimizing configuration surface — a concrete
maintainability benefit, not an arbitrary choice.

**Alternatives considered**: Playwright/Cypress E2E (rejected — out of scope for this
assessment's testing priorities, which target unit/integration/component levels per the
spec and constitution's Principle VIII).
