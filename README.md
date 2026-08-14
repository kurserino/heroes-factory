# Heroes Factory

A small full-stack CRUD application for managing hero records: create, browse, search,
inspect, edit, activate/deactivate, and permanently delete heroes.

## Overview

A hero has a name, nickname, date of birth, universe, main power, and avatar image, plus
an active/inactive lifecycle state. The application enforces a small set of business rules
around that lifecycle:

- New heroes are always created **active**.
- Only **active** heroes can be edited or permanently deleted.
- **Inactive** heroes can only be reactivated — no other action is available for them.
- Deletion is **permanent** (hard delete). There is no "trash," no `deleted_at` field, and
  no way to recover a deleted hero.

The scope is intentionally small: one resource, one primary screen, no authentication. The
goal is to demonstrate clean architecture, correct business-rule enforcement, and
maintainable code rather than feature breadth.

## Architecture

```
Frontend (React SPA)  ──HTTP/JSON──►  Backend (NestJS REST API)  ──Prisma──►  MySQL 8
```

**Backend** follows a layered flow — `Controller → Service → Repository → Prisma → MySQL`:

- **Controller**: HTTP transport only (routes, status codes, DTO validation).
- **Service**: business rules (default-active creation, active-state gating on
  edit/delete, avatar-URL verification), independent of HTTP and persistence details.
- **Repository**: the single abstraction in the codebase, isolating Prisma from the
  service. It exists for one concrete reason — it lets the service be unit-tested with an
  in-memory fake, without a real database.
- No use-case objects, mappers, gateways, or domain-event layers were introduced. With a
  single resource and no cross-cutting workflows, they would have no problem to solve.

**Frontend** has no global state manager. All server state (list, detail, mutations,
cache invalidation) is owned by TanStack Query; everything else (which dialog is open,
which hero is selected) is local component state. There is also no router — the app is a
single screen with modal/menu-driven interactions.

Both apps are TypeScript in `strict` mode, and every dependency in the stack maps to a
concrete requirement (see [Trade-offs](#trade-offs-and-decisions) below).

## Folder structure

```
heroes-factory/
├── docker-compose.yml       # MySQL 8 only — the API and web app run locally via Node.js
├── package.json              # npm workspaces root; shared dev/build/test/lint scripts
├── .env.example               # Docker Compose variables (DB name/user/password/port)
│
├── apps/
│   ├── api/                   # NestJS + Prisma REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Hero model, MySQL datasource
│   │   │   └── migrations/        # version-controlled schema history
│   │   ├── src/
│   │   │   ├── common/            # global exception filter (consistent error shape)
│   │   │   ├── prisma/             # PrismaService/PrismaModule
│   │   │   └── heroes/             # the one feature module
│   │   │       ├── dto/                    # request validation (class-validator)
│   │   │       ├── entities/               # the 10-field API representation
│   │   │       ├── heroes.controller.ts
│   │   │       ├── heroes.service.ts        # business rules live here
│   │   │       ├── heroes.repository.ts     # abstract interface
│   │   │       ├── prisma-heroes.repository.ts
│   │   │       ├── avatar-url-validator.ts  # verifies avatar_url resolves to an image
│   │   │       └── heroes.module.ts
│   │   └── test/
│   │       ├── unit/               # HeroesService + AvatarUrlValidator, in isolation
│   │       └── integration/        # full HTTP behavior against a real database
│   │
│   └── web/                   # React + Vite frontend
│       └── src/
│           ├── app/                 # App shell, theme, TanStack QueryClient
│           ├── lib/                  # fetch wrapper + API error normalization
│           ├── components/ui/        # generic, reusable (non-feature) UI pieces
│           └── features/heroes/
│               ├── api/               # heroesApi.ts (fetch calls) + heroesQueries.ts (TanStack Query hooks)
│               ├── components/        # HeroList, HeroCard, HeroActions, dialogs, states, etc.
│               ├── hooks/             # useHeroListParams (page/search local state)
│               ├── schemas/           # Zod validation for the create/edit form
│               └── types/             # Hero TypeScript type
│
└── specs/001-hero-management/   # spec-driven design artifacts (spec, plan, tasks, contracts)
```

## Technology choices and reasoning

| Choice | Why |
|---|---|
| **npm workspaces**, no Turborepo/Nx | Two packages with no shared internal library don't need build-graph tooling; workspaces alone give shared installs and root scripts. |
| **NestJS** | Structured, convention-driven Nest modules map directly onto the Controller→Service→Repository layering the constitution requires, with DI making the repository swap for testing trivial. |
| **Prisma** | Type-safe queries, and migrations are a first-class, version-controlled artifact — no hand-written SQL migration files to keep in sync. |
| **MySQL 8 via Docker Compose** | Reproducible local database without installing MySQL on the host; only the database is containerized, so app processes iterate with normal `npm run dev` hot-reload. |
| **One repository abstraction (`HeroesRepository`)** | The single sanctioned abstraction: it lets `HeroesService`'s business rules be unit-tested with a fake, without a database. No other abstraction layer was added. |
| **React + Vite** | Fast dev server, minimal config, no framework opinions the app's single screen doesn't need. |
| **Material UI** | Provides accessible-by-default primitives (dialogs, menus, switches) so accessibility didn't need to be built from scratch. |
| **TanStack Query, no Redux** | The only cross-component state is server data; TanStack Query's cache is already the source of truth for it, so a second global store would just duplicate state. |
| **React Hook Form + Zod** | Minimal re-renders, and a typed schema that mirrors the backend's validation rules for fast client-side feedback — while the backend remains the actual source of truth. |
| **Jest/Supertest (backend), Vitest/RTL (frontend)** | Each toolchain's native default — minimizes configuration surface rather than introducing a second bundler/runner. |

## Prerequisites

- Node.js 20 LTS and npm
- Docker (for the MySQL 8 container)

## Environment setup

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Defaults work out of the box for local development. `apps/api/.env`'s `DATABASE_URL` must
match the root `.env`'s MySQL credentials/port if you change them.

## Installing dependencies

```bash
npm install
```

Run once at the repository root — npm workspaces installs both `apps/api` and `apps/web`.

## Starting MySQL with Docker

```bash
docker compose up -d
docker compose ps   # confirm the mysql service is "healthy"
```

This starts MySQL 8 with a persistent named volume, so data survives container restarts.
Only the database runs in Docker; the API and frontend run locally via Node.js.

## Running migrations

```bash
npm run migrate:dev --workspace apps/api
```

Applies (and, if the schema changed, generates) migrations against the running database.
For a non-interactive/CI-style apply of already-committed migrations, use
`npm run migrate --workspace apps/api` instead (`prisma migrate deploy`).

> **Note**: `migrate:dev` needs permission to create a temporary shadow database to detect
> drift. The default `heroes_app` user (see `docker-compose.yml`) may need broader grants
> for this in a fresh environment — for local development this is a one-time
> `GRANT ALL PRIVILEGES ON *.* TO 'heroes_app'@'%'` run against the MySQL container. This
> is a local-dev convenience only; `migrate deploy` (used for repeatable/CI applies) does
> not need it.

## Starting the API

```bash
npm run dev --workspace apps/api
```

Starts the NestJS server in watch mode at `http://localhost:3000`.

## Starting the frontend

```bash
npm run dev --workspace apps/web
```

Starts the Vite dev server at `http://localhost:5173`.

**Run both at once** from the repository root:

```bash
npm run dev
```

## Running tests

```bash
npm run test --workspace apps/api        # backend unit tests
npm run test:e2e --workspace apps/api    # backend integration tests (needs the DB running)
npm run test --workspace apps/web        # frontend component tests

npm run test      # runs each workspace's default "test" script (unit/component only)
npm run lint       # lints both workspaces
```

## REST API endpoints

Base path: `/heroes`. No authentication. All requests/responses are JSON.

| Method | Path | Description |
|---|---|---|
| `POST` | `/heroes` | Create a hero (always created active) |
| `GET` | `/heroes?page=&search=` | List heroes, paginated (10/page), optional name/nickname search |
| `GET` | `/heroes/:id` | Retrieve a single hero's full details |
| `PATCH` | `/heroes/:id` | Edit an active hero's editable fields (rejects inactive heroes) |
| `PATCH` | `/heroes/:id/status` | Change only `is_active` (activate or deactivate) |
| `DELETE` | `/heroes/:id` | Permanently delete an active hero (rejects inactive heroes) |

A hero's API representation always contains exactly these fields: `id`, `name`,
`nickname`, `date_of_birth`, `universe`, `main_power`, `avatar_url`, `is_active`,
`created_at`, `updated_at`. Error responses share a consistent
`{ statusCode, error, message }` shape; ORM/database internals are never leaked to the
client. Full request/response examples: [`specs/001-hero-management/contracts/heroes-api.md`](specs/001-hero-management/contracts/heroes-api.md).

## Business rules: active/inactive heroes

- A hero is **active** by default when created.
- **Active** heroes may be edited, deactivated, or permanently deleted.
- **Inactive** heroes may only be reactivated — editing or deleting an inactive hero is
  rejected, both in what the UI offers and independently at the API level (`409
  Conflict`), so the rule holds even if a request bypasses the UI.
- Activating/deactivating changes only `is_active` (and refreshes `updated_at`); every
  other field is left untouched.
- Every activation/deactivation and every deletion requires explicit user confirmation
  before it's applied.

## Permanent deletion behavior

Deletion is a hard delete: the database row is removed entirely. There is no `deleted_at`
column, no soft-delete flag, and no recovery path — once confirmed, a deleted hero is
gone, and immediately stops appearing in any list, search, or direct lookup (`404`).
Deletion is only permitted for active heroes; an inactive hero must be reactivated before
it can be deleted.

## Trade-offs and decisions

- **No authentication.** Explicitly out of scope for this assessment; all endpoints are
  open. Not appropriate as-is for a real deployment.
- **One repository abstraction, nothing more.** Use-case objects, mappers, and similar
  layers were deliberately not added — they'd have no concrete problem to solve at this
  scale, and would just be indirection to explain.
- **No optimistic UI updates.** Mutations wait for the server response before reflecting
  a change; simpler to reason about, at the cost of a small perceived-latency difference
  for a fast local database.
- **Client-side validation does not replicate every server rule.** In particular, the
  avatar URL's "resolves to a loadable image" check only happens server-side (it requires
  a network fetch); the client validates format/required-ness for fast feedback, but the
  server remains the source of truth.
- **Single shared dev database for backend integration tests.** Integration tests run
  against the same local MySQL instance used for manual testing (clearing hero rows
  between tests), rather than a dedicated test database/container. Adequate at this scale;
  would need isolation for a larger or CI-shared environment.
- **No API versioning or rate limiting.** Not required for a single-consumer, unauthenticated,
  small-scope assessment app.

## Possible future improvements

- Authentication/authorization (e.g. per-user hero ownership).
- Optimistic UI updates for mutations, with rollback on failure.
- Code-splitting the frontend bundle (currently a single ~500 KB chunk — fine at this
  scale, but would matter for a larger app).
- A dedicated test database/container, isolated from local manual-testing data.
- Bulk operations (bulk deactivate/delete) and CSV import/export.
- Search beyond simple substring matching (e.g. fuzzy matching, multi-field ranking).
- API rate limiting and structured request logging/observability.
