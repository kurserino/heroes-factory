# Quickstart: Hero Management

Validation guide to prove the feature works end-to-end once implemented. Assumes the
project structure and contracts defined in `plan.md`, `data-model.md`, and
`contracts/heroes-api.md`.

## Prerequisites

- Node.js 20 LTS, npm
- Docker (for MySQL 8 via Docker Compose)

## 1. Start the database

```bash
cp .env.example .env
docker compose up -d
```

Confirm MySQL is healthy: `docker compose ps` shows the `mysql` service as `healthy`.

## 2. Install dependencies

```bash
npm install
```

(npm workspaces installs both `apps/api` and `apps/web` dependencies from the root.)

## 3. Apply database migrations

```bash
npm run migrate --workspace apps/api
```

## 4. Start the backend

```bash
npm run dev --workspace apps/api
```

API should be reachable at `http://localhost:3000` (or configured port).

## 5. Start the frontend

```bash
npm run dev --workspace apps/web
```

App should be reachable at `http://localhost:5173` (Vite default) or configured port.

## 6. Validation scenarios

Each scenario maps to an acceptance scenario in `spec.md`.

### Scenario A — Create and see it listed newest-first

1. Open the app; the hero list loads (loading indicator visible briefly).
2. Click the create action; fill the form with valid data (including a real, loadable
   image URL for avatar); submit.
3. **Expect**: modal closes, success feedback shown, the new hero appears as the first
   card in the list, active (not gray).

### Scenario B — Search by nickname

1. With at least one hero present, enter part of its nickname in the search field and
   submit (Enter or Search action — search does not filter live as you type).
2. **Expect**: results update to only matching heroes; page resets to 1.
3. Search for a string matching nothing.
4. **Expect**: explicit "no results" state, distinct from the empty-list state.

### Scenario C — Edit an active hero

1. Open an active hero's Edit action; change the `main_power` field; submit.
2. **Expect**: modal closes, success feedback, updated value visible in the list/detail
   view.
3. Submit the edit form with an unreachable/non-image `avatar_url`.
4. **Expect**: submission rejected, error message shown, previously entered field values
   remain in the form.

### Scenario D — Deactivate then verify restricted actions

1. Toggle an active hero's switch off; confirm in the dialog that appears.
2. **Expect**: hero turns gray; only the toggle remains available (no Edit/Delete).
3. Attempt (via direct API call) to `PATCH /heroes/:id` or `DELETE /heroes/:id` that same
   hero.
4. **Expect**: `409 Conflict` from the API in both cases.

### Scenario E — Reactivate

1. Toggle the same hero's switch back on; confirm.
2. **Expect**: hero returns to normal appearance; Edit and Delete actions reappear.

### Scenario F — Delete an active hero

1. Trigger Delete on an active hero; confirm in the dialog.
2. **Expect**: hero disappears from the list; a subsequent `GET /heroes/:id` for that id
   returns `404`.

### Scenario G — Pagination auto-adjusts after emptying a page

1. Ensure more than 10 heroes exist so a second page is reachable; navigate to the last
   page containing exactly one hero.
2. Delete that hero (with confirmation).
3. **Expect**: the app automatically navigates back to the previous page, which is
   re-fetched and shown.

## 7. Run automated tests

```bash
npm run test --workspace apps/api          # unit + integration (Jest/Supertest)
npm run test --workspace apps/web          # component tests (Vitest/RTL)
```

All backend unit/integration tests and frontend component tests listed in `plan.md`'s
Testing section should pass.
