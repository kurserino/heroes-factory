# Implementation Plan: Hero Management

**Branch**: `001-hero-management` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-hero-management/spec.md`

## Summary

A single-repository, npm-workspaces full-stack app for managing hero records: create,
browse (paginated, server-side, 10/page), search (name/nickname, explicit submit),
inspect, edit, activate/deactivate, and permanently delete. Frontend is React + Vite +
TypeScript strict + Material UI + TanStack Query + React Hook Form + Zod, with all server
state and mutation lifecycles owned by TanStack Query and no global state manager. Backend
is NestJS + TypeScript strict + Prisma + MySQL 8, structured as Controller → Service →
Repository → Prisma → MySQL, with a single repository abstraction around persistence to
keep the service unit-testable without a database. MySQL runs via Docker Compose; the app
processes run locally with Node.js. All business rules (active-state gating on edit/delete,
default-active creation, is_active-only mutation for activation) are enforced server-side.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20 LTS

**Primary Dependencies**:
- Frontend: React 18, Vite, Material UI (MUI), TanStack Query, React Hook Form, Zod
- Backend: NestJS, Prisma ORM, class-validator/class-transformer (NestJS DTO validation)

**Storage**: MySQL 8 (via Docker Compose for local development), UUID primary keys,
schema managed by Prisma migrations

**Testing**:
- Backend: Jest (unit), Supertest (API integration)
- Frontend: Vitest, React Testing Library

**Target Platform**: Web application — Node.js backend service + browser-based SPA frontend, run locally for this assessment (no deployment target specified)

**Project Type**: Web application (frontend + backend), single repo, npm workspaces (`apps/web`, `apps/api`)

**Performance Goals**: No explicit throughput target; standard responsive-web expectations (list/search responses perceived as near-instant for a small, local dataset)

**Constraints**: No authentication; hard deletion only (no soft-delete field); avatar URL must be verified to resolve to a loadable image at submission time (FR-025); exactly 10 heroes per page; search is explicit-submit, case-insensitive, matches name OR nickname

**Scale/Scope**: Small technical-assessment scope — one resource (Hero), one primary screen, modal-driven CRUD + lifecycle actions; no expectation of high concurrent load or large dataset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Proportional Architecture | Single repo, 2 apps, no microservices/CQRS/event sourcing; one repository abstraction only where it buys unit-testability | PASS |
| II. TypeScript Strict Mode | Both `apps/web` and `apps/api` configured with `strict: true`; no `any`/`@ts-ignore` planned | PASS |
| III. Pragmatic SOLID | Single `HeroesRepository` interface + Prisma impl is the only abstraction, justified by service unit-testing (Principle XI/III both satisfied); no use-case/factory/gateway/mapper layers added | PASS |
| IV. Layered Separation of Concerns | Controller (HTTP) → Service (business rules) → Repository (persistence) → Prisma → MySQL; frontend `features/heroes` separates `api/` (TanStack Query hooks) from `components/` (presentation) | PASS |
| V. Backend-Enforced Business Rules | Active-state gating on edit/delete, default-active on create, is_active-only mutation on status change, avatar-URL image verification — all enforced in `HeroesService`, independent of frontend | PASS |
| VI. Consistent RESTful API Design | `POST/GET/GET:id/PATCH/PATCH:id/status/DELETE /heroes` with consistent status codes and structured errors (see contracts) | PASS |
| VII. Version-Controlled Schema Migrations | Prisma migrations under `apps/api/prisma/migrations`; no manual schema edits | PASS |
| VIII. Risk-Prioritized Automated Testing | Backend unit tests target business rules (creation, inactive-edit/delete rejection, activation/deactivation); integration tests target API behavior end-to-end; frontend tests target critical interactions and error/empty states | PASS |
| IX. Explicit Async UI Feedback | TanStack Query `isPending`/`isError`/`isSuccess` states drive MUI loading indicators and success/error feedback on every query and mutation | PASS |
| X. Readable Over Clever Code | Feature-folder structure, direct component responsibilities, no generic abstraction layers | PASS |
| XI. Intentional Dependencies | Every dependency (MUI, TanStack Query, RHF, Zod, Prisma, NestJS) maps to a concrete requirement in the spec (loading/feedback UI, server-state lifecycle, forms, validation, migrations, REST structure) | PASS |
| XII. No Committed Secrets | `.env.example` at repo root and/or per-app; actual `.env` files gitignored | PASS |
| XIII. Reproducible Local Development | `docker-compose.yml` (MySQL only) + documented npm scripts for migrate/dev/test | PASS |
| XIV. English-Only Artifacts | All code, docs, commits in English | PASS |
| XV. Practical Accessibility | MUI components used for dialogs/menus/switches/inputs/buttons provide accessible defaults (ARIA, keyboard nav); confirmation dialogs and feedback (snackbars/alerts) kept accessible | PASS |
| XVI. Defensible Architectural Decisions | Every structural choice justified below and in README | PASS |

No violations identified. **Complexity Tracking table is not needed.**

## Project Structure

### Documentation (this feature)

```text
specs/001-hero-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── heroes-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json                  # npm workspaces root; shared dev/build/test/lint scripts
docker-compose.yml             # MySQL 8 only (frontend/backend run locally via Node.js)
.env.example                   # root-level example env (compose vars)
README.md

apps/
├── api/
│   ├── package.json
│   ├── tsconfig.json           # strict: true
│   ├── .env.example            # DATABASE_URL, PORT
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/              # shared filters/pipes (e.g. HttpExceptionFilter, ValidationPipe config)
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   └── heroes/
│   │       ├── dto/
│   │       │   ├── create-hero.dto.ts
│   │       │   ├── update-hero.dto.ts
│   │       │   ├── update-hero-status.dto.ts
│   │       │   └── list-heroes-query.dto.ts
│   │       ├── entities/
│   │       │   └── hero.entity.ts
│   │       ├── heroes.controller.ts
│   │       ├── heroes.service.ts
│   │       ├── heroes.repository.ts        # abstract interface
│   │       ├── prisma-heroes.repository.ts # Prisma implementation
│   │       └── heroes.module.ts
│   └── test/
│       ├── unit/
│       │   └── heroes.service.spec.ts
│       └── integration/
│           └── heroes.e2e-spec.ts
│
└── web/
    ├── package.json
    ├── tsconfig.json            # strict: true
    ├── vite.config.ts
    ├── .env.example             # VITE_API_BASE_URL
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── app/
    │   │   ├── App.tsx
    │   │   └── queryClient.ts
    │   ├── features/
    │   │   └── heroes/
    │   │       ├── api/
    │   │       │   ├── heroesApi.ts        # fetch wrapper calls to /heroes
    │   │       │   └── heroesQueries.ts    # TanStack Query hooks (queries + mutations)
    │   │       ├── components/
    │   │       │   ├── HeroList.tsx
    │   │       │   ├── HeroCard.tsx
    │   │       │   ├── HeroActions.tsx
    │   │       │   ├── HeroStatusToggle.tsx
    │   │       │   ├── HeroDetailsDialog.tsx
    │   │       │   ├── HeroFormDialog.tsx
    │   │       │   ├── DeleteConfirmDialog.tsx
    │   │       │   ├── StatusConfirmDialog.tsx
    │   │       │   ├── HeroSearch.tsx
    │   │       │   ├── HeroPagination.tsx
    │   │       │   └── HeroListStates.tsx   # empty/error/loading presentational states
    │   │       ├── hooks/
    │   │       │   └── useHeroListParams.ts # page + search local state
    │   │       ├── schemas/
    │   │       │   └── heroFormSchema.ts    # Zod schema for RHF
    │   │       └── types/
    │   │           └── hero.ts
    │   ├── components/
    │   │   └── ui/                          # generic, reusable non-feature UI wrappers (if any emerge)
    │   └── lib/
    │       └── apiClient.ts                 # fetch base config, error normalization
    └── test/
        └── (co-located *.test.tsx next to components, per Vitest convention)
```

**Structure Decision**: Web application structure (frontend + backend) as required by the
spec's browser UI + REST API. Single repo with npm workspaces (`apps/web`, `apps/api`) per
explicit instruction — no Turborepo/Nx, no extra packages. Backend follows NestJS's
feature-module convention scoped to the single `heroes` feature; frontend follows
feature-folder organization scoped to the single `heroes` feature. Both are intentionally
flat given the single-resource, single-screen scope (Principle I).

## Complexity Tracking

*No entries — Constitution Check reported no violations.*
