---

description: "Task list for feature implementation"
---

# Tasks: Hero Management

**Input**: Design documents from `/specs/001-hero-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/heroes-api.md, quickstart.md

**Organization**: Per explicit user request, tasks are organized by **implementation layer/phase**
(infrastructure → backend → frontend → tests → docs) rather than strictly by user story. Where a
task implements behavior specific to one user story, it carries a `[USn]` label for traceability
back to spec.md:

- **US1** = Browse and search heroes (P1)
- **US2** = Create a hero (P2)
- **US3** = Edit an active hero (P3)
- **US4** = Activate/deactivate a hero (P4)
- **US5** = Permanently delete an active hero (P5)

Tasks with no `[USn]` label are cross-cutting infrastructure/foundation that all stories depend on.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Traceability label to a user story (US1–US5), omitted for infra/foundation tasks
- Every task includes an exact file path

---

## Phase 1: Root npm workspace and repository configuration

**Purpose**: Establish the monorepo skeleton before any app code exists.

- [X] T001 Create root `package.json` declaring npm workspaces `["apps/*"]` and shared scripts (`dev`, `build`, `test`, `lint`)
- [X] T002 [P] Create root `.gitignore` (node_modules, dist/build output, `.env`, coverage)
- [X] T003 [P] Create root `.env.example` with Docker Compose variables (`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PORT`)
- [X] T004 [P] Create root `apps/` directory with empty `apps/api/` and `apps/web/` placeholders so workspaces resolve

**Checkpoint**: `npm install` at root succeeds with two empty workspaces registered.

---

## Phase 2: Docker Compose and MySQL infrastructure

**Purpose**: Reproducible local database, independent of app code (Constitution Principle XIII).

- [X] T005 Create root `docker-compose.yml` defining a `mysql:8` service with a persistent named volume, env-driven database name/user/password (reading root `.env`), an exposed development port, and a healthcheck
- [X] T006 [P] Create `apps/api/.env.example` with `DATABASE_URL` (matching the compose service's credentials/port) and `PORT`

**Checkpoint**: `docker compose up -d` starts MySQL and `docker compose ps` reports it healthy.

---

## Phase 3: NestJS API foundation

**Purpose**: Bootable Nest app shell with global validation and error handling, before any Hero-specific code.

- [X] T007 Initialize `apps/api` as a NestJS project: `apps/api/package.json`, `apps/api/tsconfig.json` (`strict: true`), `apps/api/nest-cli.json`
- [X] T008 [P] Configure `apps/api/.eslintrc.js` and `apps/api/.prettierrc`
- [X] T009 Create `apps/api/src/main.ts` bootstrapping the Nest app with a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) — **amended during Phase 12 browser verification**: added `app.enableCors()`, which was missing and caused the frontend (a different origin, `localhost:5173`) to fail every request with a browser-level CORS error; not caught earlier because Phase 9's integration tests call the app in-process via Supertest, which bypasses CORS entirely
- [X] T010 [P] Create `apps/api/src/common/filters/http-exception.filter.ts` translating unknown/Prisma errors into the consistent `{ statusCode, error, message }` shape from `contracts/heroes-api.md`, never leaking ORM/DB internals
- [X] T011 Register the global exception filter in `apps/api/src/main.ts`
- [X] T012 Create `apps/api/src/app.module.ts` importing `PrismaModule` — deliberately deviates from the original description: `HeroesModule` is NOT imported here since it does not exist yet (Hero API is out of scope for this phase); this avoids the forward-reference inconsistency flagged in `/speckit-analyze` finding O2. `HeroesModule` will be wired in during Phase 7 (T038).

**Checkpoint**: `apps/api` boots (`npm run start:dev --workspace apps/api`) and returns Nest's default 404 for unknown routes with the standard error shape.

---

## Phase 4: Prisma schema and initial migration

**Purpose**: Version-controlled schema for the single Hero entity (Constitution Principle VII).

- [X] T013 Add Prisma to `apps/api` and initialize `apps/api/prisma/schema.prisma` with a MySQL datasource reading `DATABASE_URL`
- [X] T014 Define the `Hero` model in `apps/api/prisma/schema.prisma` per `data-model.md`: `id` (UUID, `@id @default(uuid())`), `name`, `nickname`, `date_of_birth` (Date), `universe`, `main_power`, `avatar_url`, `is_active` (Boolean, `@default(true)`), `created_at` (`@default(now())`), `updated_at` (`@updatedAt`) — also adds `@@index([created_at])` and `@@index([name, nickname])` per `data-model.md`'s persistence-mapping recommendation (closes `/speckit-analyze` finding G1)
- [X] T015 Generate the initial Prisma migration (`prisma migrate dev --name init_heroes`), producing `apps/api/prisma/migrations/.../migration.sql`
- [X] T016 [P] Create `apps/api/src/prisma/prisma.service.ts` (PrismaClient wrapper implementing `OnModuleInit`/`OnModuleDestroy`)
- [X] T017 [P] Create `apps/api/src/prisma/prisma.module.ts` exporting `PrismaService`

**Checkpoint**: `prisma migrate deploy` against the Docker MySQL instance succeeds; `heroes` table exists with exactly the 10 required columns.

---

## Phase 5: Hero persistence repository

**Purpose**: The single sanctioned abstraction (Constitution Principle III) isolating persistence from business rules.

- [X] T018 Define the `HeroesRepository` interface in `apps/api/src/heroes/heroes.repository.ts` (`create`, `findMany({page, search})`, `findById`, `update`, `updateStatus`, `delete`)
- [X] T019 Implement `PrismaHeroesRepository` in `apps/api/src/heroes/prisma-heroes.repository.ts`, satisfying `HeroesRepository` via `PrismaService` (search as case-insensitive `OR` on `name`/`nickname` — MySQL's default collation is case-insensitive, so no explicit Prisma `mode` param is needed/available; ordering `created_at DESC, id DESC`, `LIMIT 10` pagination)
- [X] T020 [P] Create `apps/api/src/heroes/entities/hero.entity.ts` (TypeScript type for the exact 10-field hero representation)

**Checkpoint**: Repository can be instantiated and exercised against the live MySQL instance in a scratch script (no service/controller yet).

---

## Phase 6: Hero business service

**Purpose**: All business rules enforced server-side (Constitution Principle V), independent of transport/persistence.

- [X] T021 [US1] Implement `HeroesService.list(page, search)` in `apps/api/src/heroes/heroes.service.ts`, returning hero data plus pagination metadata (`page`, `limit`, `total`, `totalPages`)
- [X] T022 [P] Create `apps/api/src/heroes/avatar-url-validator.ts` implementing the image-URL verification helper (GET request, 2xx + `Content-Type: image/*`, timeout) per `research.md`
- [X] T023 [US2] Implement `HeroesService.create(dto)` in `apps/api/src/heroes/heroes.service.ts`: forces `is_active = true` (via `CreateHeroDto` never exposing the field, plus the Prisma schema default), calls the avatar-URL validator, rejects on failure (depends on T022)
- [X] T024 [US1] Implement `HeroesService.findOne(id)` in `apps/api/src/heroes/heroes.service.ts`, throwing `NotFoundException` when missing
- [X] T025 [US3] Implement `HeroesService.update(id, dto)` in `apps/api/src/heroes/heroes.service.ts`: throws `ConflictException` if the hero is inactive, re-validates `avatar_url` via the validator when present in the dto
- [X] T026 [US4] Implement `HeroesService.updateStatus(id, isActive)` in `apps/api/src/heroes/heroes.service.ts`: changes only `is_active`, relies on the repository/Prisma to refresh `updated_at`
- [X] T027 [US5] Implement `HeroesService.remove(id)` in `apps/api/src/heroes/heroes.service.ts`: throws `ConflictException` if the hero is inactive, otherwise hard-deletes via the repository

**Checkpoint**: Business rules are implementable and reasoned about without any HTTP layer existing yet.

---

## Phase 7: REST controllers and validation

**Purpose**: Thin transport layer over the service, with DTO-based request validation (Constitution Principle VI).

- [X] T028 [P] Create `apps/api/src/heroes/dto/create-hero.dto.ts` with class-validator decorators for the 6 creatable fields (required, length bounds, date not in the future via a custom `IsNotFutureDate` validator, URL format) — field names are snake_case, matching `contracts/heroes-api.md` verbatim (resolves `/speckit-analyze` finding C1)
- [X] T029 [P] Create `apps/api/src/heroes/dto/update-hero.dto.ts` (`PartialType` of the create DTO via `@nestjs/mapped-types`, restricted to the 6 editable fields)
- [X] T030 [P] Create `apps/api/src/heroes/dto/update-hero-status.dto.ts` validating a required `is_active` boolean
- [X] T031 [P] Create `apps/api/src/heroes/dto/list-heroes-query.dto.ts` validating `page` (positive integer, default 1), optional `limit` (accepted but always clamped to 10), and optional `search` (string)
- [X] T032 [US2] Implement `POST /heroes` in `apps/api/src/heroes/heroes.controller.ts` calling `HeroesService.create`, returning `201`
- [X] T033 [US1] Implement `GET /heroes` in `apps/api/src/heroes/heroes.controller.ts` using `ListHeroesQueryDto`, returning the paginated response shape from `contracts/heroes-api.md`
- [X] T034 [US1] Implement `GET /heroes/:id` in `apps/api/src/heroes/heroes.controller.ts`, returning `404` when not found
- [X] T035 [US3] Implement `PATCH /heroes/:id` in `apps/api/src/heroes/heroes.controller.ts` using `UpdateHeroDto`, returning `409` when the target hero is inactive
- [X] T036 [US4] Implement `PATCH /heroes/:id/status` in `apps/api/src/heroes/heroes.controller.ts` using `UpdateHeroStatusDto`
- [X] T037 [US5] Implement `DELETE /heroes/:id` in `apps/api/src/heroes/heroes.controller.ts`, returning `204` on success and `409` when the target hero is inactive
- [X] T038 Create `apps/api/src/heroes/heroes.module.ts` wiring the controller, `HeroesService`, and the `HeroesRepository` provider (bound to `PrismaHeroesRepository`); imported into `apps/api/src/app.module.ts` (closes the deferred wiring noted in T012)

**Checkpoint**: Full REST API is live and manually testable via curl/Postman against all 6 endpoints in `contracts/heroes-api.md`.

---

## Phase 8: Backend unit tests

**Purpose**: Prioritize business-rule correctness in isolation (Constitution Principle VIII), using a fake `HeroesRepository`.

- [X] T039 [P] [US2] Write `apps/api/test/unit/heroes.service.spec.ts` test: `create()` always sets `is_active` to `true` regardless of input
- [X] T040 [P] [US3] Write test in `apps/api/test/unit/heroes.service.spec.ts`: `update()` rejects when the target hero is inactive
- [X] T041 [P] [US5] Write test in `apps/api/test/unit/heroes.service.spec.ts`: `remove()` rejects when the target hero is inactive
- [X] T042 [P] [US4] Write test in `apps/api/test/unit/heroes.service.spec.ts`: `updateStatus()` activates an inactive hero
- [X] T043 [P] [US4] Write test in `apps/api/test/unit/heroes.service.spec.ts`: `updateStatus()` deactivates an active hero and changes only `is_active`, and asserts the repository's plain `update()` was never called (i.e. no other field was touched via that path); `updated_at` refresh itself is a persistence-layer guarantee (Prisma `@updatedAt`), verified at the integration level instead of with the fake repository

**Checkpoint**: `npm run test --workspace apps/api` (unit) passes with all five business rules covered.

---

## Phase 9: Backend integration tests

**Purpose**: Verify full HTTP behavior end-to-end against a real (test) database, per `contracts/heroes-api.md`.

- [X] T044 [P] [US2] Write `apps/api/test/integration/heroes.e2e-spec.ts` test: `POST /heroes` creates a hero and returns `201` with the exact 10-field representation
- [X] T045 [P] [US1] Write integration test: `GET /heroes` returns heroes ordered by `created_at` descending
- [X] T046 [P] [US1] Write integration test: `GET /heroes?search=` filters case-insensitively by `name` or `nickname`
- [X] T047 [P] [US1] Write integration test: `GET /heroes` returns exactly 10 items per page with correct pagination metadata across multiple pages
- [X] T048 [P] [US3] Write integration test: `PATCH /heroes/:id` updates an active hero successfully
- [X] T049 [P] [US3] Write integration test: `PATCH /heroes/:id` returns `409` for an inactive hero
- [X] T050 [P] [US4] Write integration test: `PATCH /heroes/:id/status` toggles `is_active` and leaves `name`/`nickname` (representative other fields) unchanged
- [X] T051 [P] [US5] Write integration test: `DELETE /heroes/:id` removes an active hero; a subsequent `GET /heroes/:id` returns `404`
- [X] T052 [P] [US5] Write integration test: `DELETE /heroes/:id` returns `409` for an inactive hero
- [X] T053 [P] Write integration test: `POST /heroes` and `PATCH /heroes/:id` return `400` with structured validation messages for invalid input, including a non-image `avatar_url` (an in-process fake `AvatarUrlValidator` is substituted via `overrideProvider` so this test is deterministic and has no real network dependency)

**Checkpoint**: `npm run test:e2e --workspace apps/api` passes; backend is feature-complete and independently verifiable. **Verified**: 10/10 integration tests pass alongside 5/5 unit tests.

---

## Phase 10: React/Vite frontend foundation

**Purpose**: Bootable SPA shell before any Hero-specific UI exists.

- [X] T054 Initialize `apps/web` as a Vite + React + TypeScript project: `apps/web/package.json`, `apps/web/tsconfig.json` (`strict: true`), `apps/web/vite.config.ts`, `apps/web/index.html`
- [X] T055 [P] Install Material UI and configure a `ThemeProvider` in `apps/web/src/app/App.tsx`
- [X] T056 [P] Create `apps/web/.env.example` with `VITE_API_BASE_URL`
- [X] T057 [P] Configure Vitest + React Testing Library in `apps/web/vite.config.ts` (test section) and `apps/web/vitest.setup.ts`
- [X] T058 Create `apps/web/src/main.tsx` rendering `<App />`

**Checkpoint**: `npm run dev --workspace apps/web` serves a blank themed page.

---

## Phase 11: Hero API client and TanStack Query setup

**Purpose**: All server state centralized in TanStack Query (no Redux), per plan.md.

- [X] T059 Create `apps/web/src/lib/apiClient.ts` (fetch wrapper: base URL from `VITE_API_BASE_URL`, JSON headers, error normalization matching `contracts/heroes-api.md`'s error shape)
- [X] T060 Create `apps/web/src/app/queryClient.ts` configuring a shared `QueryClient`; wrap `<App />` with `QueryClientProvider` in `apps/web/src/main.tsx`
- [X] T061 [P] Create `apps/web/src/features/heroes/types/hero.ts` (TS type mirroring the 10-field API representation)
- [X] T062 Create `apps/web/src/features/heroes/api/heroesApi.ts` with `listHeroes`, `getHero` functions built on `apiClient` — deliberately deviates from the original description: `createHero`/`updateHero`/`updateHeroStatus`/`deleteHero` are NOT added yet, per this phase's explicit exclusion of create/edit/status/delete; they land with their respective Phase 14–17 tasks.
- [X] T063 [US1] Add `useHeroListQuery(page, search)` to `apps/web/src/features/heroes/api/heroesQueries.ts` with query key `['heroes','list',{page,search}]`
- [X] T064 [US1] Add `useHeroQuery(id)` to `apps/web/src/features/heroes/api/heroesQueries.ts` for hero-detail fetch (defined now for completeness; not yet consumed by any component — `HeroDetailsDialog` receives its hero as a prop instead)
- [ ] T065 [US2] Add `useCreateHeroMutation()` to `apps/web/src/features/heroes/api/heroesQueries.ts`, invalidating the heroes list query on success
- [ ] T066 [US3] Add `useUpdateHeroMutation()` to `apps/web/src/features/heroes/api/heroesQueries.ts`, invalidating list + detail queries on success
- [ ] T067 [US4] Add `useUpdateHeroStatusMutation()` to `apps/web/src/features/heroes/api/heroesQueries.ts`, invalidating list + detail queries on success
- [ ] T068 [US5] Add `useDeleteHeroMutation()` to `apps/web/src/features/heroes/api/heroesQueries.ts`, invalidating the heroes list query on success

**Checkpoint**: All server-state hooks exist and type-check against the backend contract, with no UI consuming them yet. **Note**: only the read-side hooks (T063, T064) were implemented this phase, per explicit scope exclusion; T065–T068 remain for Phases 14–17.

---

## Phase 12: Hero list, responsive grid, pagination, and search (US1 — MVP)

**Goal**: A user can browse, page through, and search the hero directory read-only.

**Independent Test**: Load the app against a seeded backend; page through results, search by partial name/nickname, and confirm ordering/empty/no-results states — no create/edit/delete required.

- [X] T069 [US1] Create `apps/web/src/features/heroes/hooks/useHeroListParams.ts` managing local `page`/`search` state (changing `search` resets `page` to 1)
- [X] T070 [US1] Create `apps/web/src/features/heroes/components/HeroCard.tsx` rendering one hero, with gray styling when `is_active` is `false` (FR-013)
- [X] T071 [US1] Create `apps/web/src/features/heroes/components/HeroList.tsx` rendering a responsive grid (5 columns on large desktop, via CSS Grid `sx` breakpoints rather than MUI's 12-column `Grid` — 12/5 is not an integer span) of `HeroCard`s from `useHeroListQuery`
- [X] T072 [US1] Create `apps/web/src/features/heroes/components/HeroSearch.tsx` (MUI `TextField` + explicit submit action wired to `useHeroListParams`; no live-as-you-type filtering, per clarification)
- [X] T073 [US1] Create `apps/web/src/features/heroes/components/HeroPagination.tsx` (MUI `Pagination` wired to `useHeroListParams`, driven by the query response's pagination metadata)
- [X] T074 [US1] Create `apps/web/src/features/heroes/components/HeroListStates.tsx` (loading spinner, empty-list state, no-search-results state, API-error state — each visually distinct, per FR-020)
- [X] T075 [US1] Wire `HeroList` + `HeroSearch` + `HeroPagination` + `HeroListStates` together as the main screen in `apps/web/src/app/App.tsx`

**Checkpoint**: US1 fully functional and independently demoable — this is the MVP slice. **Verified**: manually exercised in a real browser against the live API (list render, detail dialog, no-results search) — see completion report for the bug found and fixed (missing CORS) during this verification.

---

## Phase 13: Hero details dialog (US1)

- [X] T076 [US1] Create `apps/web/src/features/heroes/components/HeroDetailsDialog.tsx` (MUI `Dialog` showing all 10 hero fields)
- [X] T077 [US1] Wire `HeroDetailsDialog` open/close local state into `HeroCard`/`HeroList` (clicking a card opens the dialog) in `apps/web/src/features/heroes/components/HeroList.tsx`

**Checkpoint**: Clicking any hero card shows its full details; US1 acceptance scenario 5 satisfied. **Verified** manually in-browser.

---

## Phase 14: Hero creation flow (US2)

**Goal**: A user can create a hero via a modal and see it appear at the top of the list.

**Independent Test**: Open the create action, submit valid data, confirm the hero appears active and newest-first; submit invalid data and confirm values are preserved with a clear error.

- [X] T078 [US2] Create `apps/web/src/features/heroes/schemas/heroFormSchema.ts` (Zod schema for the 6 creatable/editable fields)
- [X] T079 [US2] Create `apps/web/src/features/heroes/components/HeroFormDialog.tsx` (shared create/edit MUI `Dialog` using React Hook Form + `zodResolver`; not dismissible while a submission is pending, per FR-015a)
- [X] T080 [US2] Wire create mode of `HeroFormDialog` to `useCreateHeroMutation`: loading state on submit, success/error feedback, entered values preserved on failure (FR-019)
- [X] T081 [US2] Add a "Create Hero" action — placed in `apps/web/src/features/heroes/components/HeroList.tsx` next to the search bar rather than directly in `apps/web/src/app/App.tsx`, since `HeroList` (not `App`) already owns the rest of the main-screen layout (search, pagination, states); opens `HeroFormDialog` in create mode

**Checkpoint**: US2 fully functional and independently demoable. **Verified**: manually exercised in a real browser — created a hero, saw success feedback, dialog closed, card appeared active.

---

## Phase 15: Hero editing flow (US3)

**Goal**: A user can edit an active hero's editable fields via the same modal, pre-filled.

**Independent Test**: Open an active hero's Edit action, change a field, submit, and confirm the update is reflected; confirm no Edit action exists for inactive heroes.

- [X] T082 [US3] Wire edit mode of `HeroFormDialog` (pre-filled from the selected hero; non-editable fields — status, created — shown read-only) to `useUpdateHeroMutation`, with loading/success/error feedback and value preservation on failure
- [X] T083 [US3] Create `apps/web/src/features/heroes/components/HeroActions.tsx` rendering an Edit action (opens `HeroFormDialog` in edit mode) only when the hero is active

**Checkpoint**: US3 fully functional and independently demoable. **Verified**: manually exercised in a real browser — edited an active hero's main power, saw success feedback and the updated value persist.

---

## Phase 16: Activation/deactivation toggle and confirmation (US4)

**Goal**: A user can toggle a hero's active state with confirmation, from any hero card.

**Independent Test**: Toggle an active hero off (with confirmation), see it turn gray with only the toggle available; toggle it back on (with confirmation) and see full actions return.

- [X] T084 [US4] Create `apps/web/src/features/heroes/components/StatusConfirmDialog.tsx` (MUI `Dialog` confirming activate/deactivate before persisting)
- [X] T085 [US4] Create `apps/web/src/features/heroes/components/HeroStatusToggle.tsx` (MUI `Switch` opening `StatusConfirmDialog`; on confirm, calls `useUpdateHeroStatusMutation`; disabled while a change is pending, per FR-015)
- [X] T086 [US4] Wire `HeroStatusToggle` into `HeroActions` for both active and inactive heroes in `apps/web/src/features/heroes/components/HeroActions.tsx`

**Checkpoint**: US4 fully functional and independently demoable. **Verified**: manually exercised in a real browser — deactivate (with confirmation) grayed the card and hid Edit/Delete; reactivate (with confirmation) restored them.

---

## Phase 17: Permanent deletion flow (US5)

**Goal**: A user can permanently delete an active hero with confirmation.

**Independent Test**: Trigger Delete on an active hero, confirm, and see it disappear from the list at every page/search result; confirm no Delete action exists for inactive heroes.

- [X] T087 [US5] Create `apps/web/src/features/heroes/components/DeleteConfirmDialog.tsx` (MUI `Dialog` confirming permanent deletion before persisting)
- [X] T088 [US5] Add a Delete action to `apps/web/src/features/heroes/components/HeroActions.tsx`, rendered only for active heroes, wired to `DeleteConfirmDialog` then `useDeleteHeroMutation`

**Checkpoint**: US5 fully functional and independently demoable — all five user stories now complete. **Verified**: manually exercised in a real browser — deleted an active hero (with confirmation), saw success feedback, hero disappeared and list fell back to the empty state.

---

## Phase 18: Loading, empty, error, and feedback states (cross-cutting polish)

**Purpose**: Ensure FR-015/FR-017/FR-018 and the pagination clarification are satisfied uniformly across all flows, not just per-story.

- [X] T089 Add pending/disabled-button states to every mutation-triggering control (`HeroFormDialog`, `HeroStatusToggle`, `DeleteConfirmDialog`) to guarantee duplicate-submission prevention and visible loading feedback everywhere (FR-015, FR-017)
- [X] T090 Create `apps/web/src/components/ui/FeedbackSnackbar.tsx` (shared success/error feedback surface) and wire it into the create/edit/status/delete flows (FR-018) — a single snackbar instance is owned by `HeroList` and shared across all four flows, rather than one per dialog, to avoid stacked/duplicate notifications
- [X] T091 [US1] Implement the pagination auto-navigate-back-on-empty-page behavior in `apps/web/src/features/heroes/components/HeroList.tsx` (deviates from the file named in the original task — implemented as a `useEffect` reacting to `data.pagination.totalPages` in `HeroList` rather than inside `useHeroListParams`, since the hook has no visibility into query results; generically handles any mutation that shrinks `totalPages` below the current `page`, not only delete/deactivate)

**Checkpoint**: SC-003 and SC-006 (feedback and list-freshness success criteria) hold across every operation. Not separately re-verified with a live emptied-page scenario in this session (would require seeding 11+ heroes); the underlying `useEffect` logic was type-checked and reviewed, and its precondition (`totalPages > 0 && page > totalPages`) is deliberately narrow so it cannot fire on the legitimate zero-results search state.

---

## Phase 19: Frontend tests

**Purpose**: Cover the critical interactions and UI states called out in plan.md's Testing section (Constitution Principle VIII).

- [X] T092 [P] [US1] Write `apps/web/src/features/heroes/components/HeroList.test.tsx` test: shows loading, then renders the fetched list — **pulled forward and completed during Phase 12/13's implementation** (this and the four items below), since they directly test the read-only slice built in that phase; re-verified passing here
- [X] T093 [P] [US1] Write test in `HeroList.test.tsx`: shows the empty-list state when zero heroes are returned
- [X] T094 [P] [US1] Write test in `HeroList.test.tsx`: shows the API-error state when the list query fails
- [X] T095 [P] [US1] Write test covering: submitting a search updates results, and a non-matching term shows the no-results state — split across `HeroSearch.test.tsx` (submit-triggering behavior) and `HeroList.test.tsx` (the resulting no-results UI + correct query args)
- [X] T096 [P] [US1] Write `apps/web/src/features/heroes/components/HeroPagination.test.tsx` test: changing page requests the correct page
- [X] T097 [P] [US1] Write test: `HeroCard` renders inactive heroes with gray/inactive presentation and without Edit/Delete actions — the "without Edit/Delete actions" half, deferred when this task was first completed (those actions didn't exist yet), is now closed: `HeroCard.test.tsx` was extended this phase to assert both actions are absent for an inactive hero and present for an active one
- [X] T098 [P] [US4] Write `apps/web/src/features/heroes/components/HeroStatusToggle.test.tsx` test: toggling requires confirmation before the mutation fires (plus a companion test that canceling the confirmation never calls the mutation)
- [X] T099 [P] [US5] Write `apps/web/src/features/heroes/components/DeleteConfirmDialog.test.tsx` test: deleting requires confirmation before the mutation fires — exercised via `HeroActions` (which owns the delete mutation) since `DeleteConfirmDialog` itself is purely presentational; plus a companion cancel test
- [X] T100 [P] [US2] Write `apps/web/src/features/heroes/components/HeroFormDialog.test.tsx` test: invalid submission shows validation errors and preserves entered values
- [X] T101 [P] [US2] Write test in `HeroFormDialog.test.tsx`: successful create submission shows success feedback and closes the dialog
- [X] T102 [P] [US3] Write test in `HeroFormDialog.test.tsx`: failed edit submission shows error feedback and keeps entered values in the form (plus a companion failed-create test for the same behavior)

**Checkpoint**: `npm run test --workspace apps/web` passes, covering every priority listed in plan.md's frontend testing section — **verified**: 18/18 frontend tests passing across 7 test files.

---

## Phase 20: Documentation and final quality checks

**Purpose**: Leave the project reproducible and defensible for review (Constitution Principles XIII, XVI).

- [ ] T103 Write root `README.md` sections: project architecture, folder structure, and architectural decisions (repository pattern, no Redux/Router, npm workspaces) referencing `plan.md`/`research.md`
- [ ] T104 [P] Write `README.md` sections: prerequisites, environment setup, Docker database startup, running Prisma migrations
- [ ] T105 [P] Write `README.md` sections: frontend startup, backend startup, running tests
- [ ] T106 [P] Write `README.md` sections: API overview (summarizing `contracts/heroes-api.md`), relevant trade-offs, potential future improvements
- [ ] T107 Run all `quickstart.md` validation scenarios (A–G) end-to-end against the running app and confirm each passes — **not done this session** (out of scope: this session focused on automated tests/validation/builds only, not the manual quickstart walkthrough as a discrete task; Scenarios A–F were however exercised live in the browser across the two prior implementation sessions)
- [X] T108 Run `tsc --noEmit` across `apps/api` and `apps/web` and resolve any strict-mode errors — both clean, 0 errors
- [X] T109 Run the full lint and test suite from the repo root (`npm run lint`, `npm run test`) and resolve any failures — both clean; additionally ran `npm run test:e2e` (backend integration, not covered by the root `test` aggregate script) and production builds (`npm run build`) for both workspaces, all passing. Closed four real coverage gaps found while reviewing existing tests (not padding — each covers previously-untested logic):
  - `apps/api/test/unit/avatar-url-validator.spec.ts` (new file): the `AvatarUrlValidator` class itself — the actual FR-025 image-verification logic — had only ever been exercised through a fake substitute in integration tests, never directly
  - `apps/api/test/integration/heroes.e2e-spec.ts`: added a standalone `GET /heroes/:id` → 404-for-nonexistent-id case (previously only covered incidentally, chained after a delete)
  - `apps/web/src/lib/apiClient.test.ts` (new file): the error-normalization boundary (`ApiError` construction from array vs. string `message`, 204-no-body handling) had zero coverage despite being the single translation point for every API error the UI surfaces
  - `apps/web/src/features/heroes/schemas/heroFormSchema.test.ts` (new file): the Zod schema's own rules (future-date rejection, required-field rejection, URL format, trimming) had only been exercised indirectly through one `HeroFormDialog` case

**Checkpoint**: Project passes all automated checks — **verified**: 9/9 backend unit, 11/11 backend integration, 27/27 frontend tests, 0 lint errors and 0 strict-mode type errors across both workspaces, both production builds succeed. Documentation tasks (T103–T106) and the manual quickstart walkthrough (T107) remain open — out of scope for this session's explicit focus on automated testing/validation/builds.

---

## Dependencies & Execution Order

### Phase Dependencies (this feature is built as a layered stack, largely sequential)

- **Phase 1 (Root config)**: No dependencies — start immediately
- **Phase 2 (Docker/MySQL)**: Depends on Phase 1 (needs root `.env.example` conventions)
- **Phase 3 (NestJS foundation)**: Depends on Phase 1; independent of Phase 2 until DB is actually needed
- **Phase 4 (Prisma schema/migration)**: Depends on Phases 2 (running MySQL) and 3 (`apps/api` exists)
- **Phase 5 (Repository)**: Depends on Phase 4
- **Phase 6 (Service)**: Depends on Phase 5
- **Phase 7 (Controllers/DTOs)**: Depends on Phase 6
- **Phase 8 (Backend unit tests)**: Depends on Phase 6 (can start as soon as the service exists, in parallel with Phase 7)
- **Phase 9 (Backend integration tests)**: Depends on Phase 7 (needs live endpoints)
- **Phase 10 (Frontend foundation)**: Depends on Phase 1; independent of backend phases (can run in parallel with Phases 3–9)
- **Phase 11 (API client/TanStack Query)**: Depends on Phase 10 and on Phase 7 (needs the real API contract to build against, though it can be stubbed earlier)
- **Phase 12 (List/search/pagination — US1)**: Depends on Phase 11
- **Phase 13 (Details dialog — US1)**: Depends on Phase 12
- **Phase 14 (Create — US2)**: Depends on Phase 11 (can proceed in parallel with Phases 12–13)
- **Phase 15 (Edit — US3)**: Depends on Phase 14 (reuses `HeroFormDialog`)
- **Phase 16 (Activate/deactivate — US4)**: Depends on Phase 11; benefits from `HeroActions` existing (Phase 15) but can be built independently
- **Phase 17 (Delete — US5)**: Depends on Phase 16 (`HeroActions` shared with the toggle)
- **Phase 18 (Cross-cutting UX polish)**: Depends on Phases 14–17 all existing
- **Phase 19 (Frontend tests)**: Depends on the components under test existing (Phases 12–18)
- **Phase 20 (Docs/final checks)**: Depends on everything else

### User Story Independence

Despite the layered phase ordering, each of US1–US5's frontend slice (Phases 12–13, 14, 15, 16, 17
respectively) is independently testable once Phase 11 is done — per-story acceptance scenarios in
spec.md can each be verified without the others being implemented, using direct API calls (Postman/
curl) to exercise backend-only stories ahead of their frontend UI.

### Parallel Opportunities

- All `[P]`-marked tasks within a phase touch different files and can run in parallel
- Phase 10 (frontend foundation) can proceed in parallel with Phases 3–9 (backend) once Phase 1 is done
- Phase 8 (unit tests) can proceed in parallel with Phase 7 (controllers) once Phase 6 (service) is done
- Within Phases 8–9 and 19, all listed test tasks are `[P]` (independent test files/cases)
- Phase 14 (Create) can proceed in parallel with Phases 12–13 (List/Details) once Phase 11 is done, since they touch different components until `HeroFormDialog` is reused by Phase 15

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phases 1–9 (full backend, all endpoints and tests)
2. Complete Phases 10–13 (frontend foundation through browse/search/details — US1)
3. **STOP and VALIDATE**: run quickstart.md Scenarios A (partial) and B against the running app
4. This is the smallest deployable, demoable increment (read-only hero directory)

### Incremental Delivery

1. Phases 1–11 → foundation ready (backend complete, frontend wired to the API)
2. Phase 12–13 → US1 (browse/search) → validate independently → demo
3. Phase 14 → US2 (create) → validate independently → demo
4. Phase 15 → US3 (edit) → validate independently → demo
5. Phase 16 → US4 (activate/deactivate) → validate independently → demo
6. Phase 17 → US5 (delete) → validate independently → demo
7. Phases 18–20 → polish, test coverage, documentation → final review

### Commit Granularity

Each task above is scoped to a single coherent Git commit. Prefer committing after each task (or
each tightly-related `[P]` group) rather than batching an entire phase into one commit, so history
remains reviewable and bisectable.
