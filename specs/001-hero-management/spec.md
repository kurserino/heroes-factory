# Feature Specification: Hero Management

**Feature Branch**: `001-hero-management`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Build a Hero Management application. The application allows users to create, browse, search, inspect, edit, activate, deactivate, and permanently delete hero records..."

## Clarifications

### Session 2026-08-14

- Q: When a delete or deactivation removes the last hero from the page a user is currently viewing, should the list automatically move them back to the previous page, or just re-show the (now shorter or empty) current page? → A: Auto-navigate back to the previous page if the current page becomes empty after the operation.
- Q: Should the avatar URL field accept any well-formed URL as-is, or must the system verify it actually points to a loadable image before accepting it? → A: Actively fetch/verify the URL resolves to a loadable image before accepting the submission.
- Q: Should hero search results update automatically as the user types (live search), or only after the user explicitly submits the search? → A: Explicit search: results only update when the user submits (Enter key or Search button).
- Q: If a user tries to close the create/edit modal while they have unsaved changes or a submission is in flight, what should happen? → A: Modal cannot be dismissed while a submission is pending; once idle, it can always be closed immediately (no confirmation for unsaved edits).
- Q: Does activating/deactivating a hero refresh its `updated_at` timestamp, or does "leaving all other fields untouched" (FR-010) include `updated_at`? → A: `updated_at` IS refreshed on activation/deactivation, since it is a general last-modified timestamp.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and search heroes (Priority: P1)

A user opens the application and sees a paginated list of heroes, newest first, and can
search that list by name or nickname to quickly find a specific hero, then open a hero to
view its full details.

**Why this priority**: This is the entry point of the application and the only way any
other capability (create, edit, activate, delete) is reached. Without it, no other story
is usable or demonstrable.

**Independent Test**: Can be fully tested by loading the application with a set of
pre-existing heroes, paging through the list, searching by partial name/nickname, and
opening a hero's detail view — delivers value as a standalone read-only hero directory.

**Acceptance Scenarios**:

1. **Given** more than 10 heroes exist, **When** the user opens the application, **Then**
   the first page shows the 10 most recently created heroes, ordered newest first.
2. **Given** the user is viewing a page of results, **When** the user navigates to the
   next page, **Then** the next 10 heroes (by creation order) are displayed and the page
   loads with visible loading feedback.
3. **Given** a hero named "Peter Parker" with nickname "Spider-Man" exists, **When** the
   user searches "spider", **Then** that hero appears in the filtered results.
4. **Given** the user searches for text that matches no hero's name or nickname, **When**
   results are returned, **Then** the interface shows an explicit "no results" state.
5. **Given** the user clicks a hero card, **When** the detail modal opens, **Then** all of
   the hero's fields are displayed.
6. **Given** a hero is inactive, **When** it is shown in the list, **Then** it is rendered
   with a visually distinct gray appearance.

---

### User Story 2 - Create a hero (Priority: P2)

A user creates a new hero record by filling out a form in a modal, and the new hero
immediately appears in the list as active.

**Why this priority**: Creation is the primary way data enters the system and is required
before edit, activation, or deletion have anything to act on.

**Independent Test**: Can be fully tested by opening the create modal, submitting valid
hero data, and confirming the hero now appears at the top of the list as active — delivers
value by populating the directory.

**Acceptance Scenarios**:

1. **Given** the hero list screen, **When** the user triggers the create action, **Then**
   a modal opens with fields for name, nickname, date of birth, universe, main power, and
   avatar URL.
2. **Given** the create modal with valid data entered, **When** the user submits, **Then**
   the hero is created as active, the modal closes, and the list reflects the new hero as
   the newest entry.
3. **Given** the create modal with invalid or incomplete data, **When** the user submits,
   **Then** the submission is rejected, an explanatory error is shown, and the entered
   values remain in the form.
4. **Given** a submission is in progress, **When** the user attempts to submit again before
   it completes, **Then** the duplicate submission is prevented.

---

### User Story 3 - Edit an active hero (Priority: P3)

A user updates the editable details of an existing active hero through a modal, and the
list reflects the updated information afterward.

**Why this priority**: Editing lets existing records be corrected or kept current; it
depends on heroes already existing (Story 2) but is independent of activation/deletion
flows.

**Independent Test**: Can be fully tested by opening an active hero's edit modal, changing
a field, submitting, and confirming the change is reflected in the list and detail view —
delivers value by keeping hero data accurate.

**Acceptance Scenarios**:

1. **Given** an active hero, **When** the user opens its edit action, **Then** a modal
   opens pre-filled with all current hero information, and only name, nickname, date of
   birth, universe, main power, and avatar URL are modifiable.
2. **Given** the edit modal with changes made, **When** the user submits valid data,
   **Then** the hero is updated, the modal closes, and the list/detail view show the new
   values.
3. **Given** the edit modal with invalid data, **When** the user submits, **Then** the
   submission is rejected, an explanatory error is shown, and the entered values remain in
   the form.
4. **Given** an inactive hero, **When** the user views it in the list, **Then** no Edit
   action is available for it.

---

### User Story 4 - Activate or deactivate a hero (Priority: P4)

A user toggles a hero's active/inactive state directly from the list, confirming the
change before it is applied.

**Why this priority**: Activation state controls what other actions (edit, delete) are
available on a hero and is the mechanism for retiring a hero without losing its data.

**Independent Test**: Can be fully tested by toggling an active hero to inactive (with
confirmation), observing it turn gray and lose its Edit/Delete actions, then toggling it
back to active — delivers value as a standalone lifecycle control independent of
create/edit/delete.

**Acceptance Scenarios**:

1. **Given** an active hero, **When** the user switches its toggle off, **Then** the user
   is asked to confirm before the hero becomes inactive.
2. **Given** the user confirms deactivation, **When** the change is persisted, **Then**
   the hero is shown grayed out in the list, retains its Delete-and-Edit-disabled state,
   and only exposes the toggle.
3. **Given** an inactive hero, **When** the user switches its toggle on, **Then** the user
   is asked to confirm before the hero becomes active again.
4. **Given** the user confirms reactivation, **When** the change is persisted, **Then**
   the hero returns to its normal appearance and regains Edit and Delete actions.
5. **Given** a toggle confirmation is pending, **When** the user attempts to trigger it
   again before it completes, **Then** the duplicate action is prevented.

---

### User Story 5 - Permanently delete an active hero (Priority: P5)

A user permanently removes an active hero record after confirming the irreversible action,
and the hero disappears from the list.

**Why this priority**: Deletion is destructive and used least frequently; it depends on a
hero existing and being active, and is intentionally the last capability layered on.

**Independent Test**: Can be fully tested by deleting an active hero (with confirmation)
and confirming it no longer appears anywhere in the list — delivers value by allowing
permanent removal of erroneous or unwanted records.

**Acceptance Scenarios**:

1. **Given** an active hero, **When** the user triggers Delete, **Then** the user is asked
   to confirm before the hero is permanently removed.
2. **Given** the user confirms deletion, **When** the deletion completes, **Then** the hero
   no longer appears in the list at any page or search result.
3. **Given** an inactive hero, **When** the user views it in the list, **Then** no Delete
   action is available for it.

---

### Edge Cases

- What happens when the hero list is empty (no heroes exist at all)? The interface must
  show an explicit empty state, distinct from the no-search-results state.
- What happens when a create, edit, activation-toggle, or delete request fails (e.g. the
  backend is unreachable or returns an error)? The interface must show a clear error
  message and must not silently leave the user unsure whether the action succeeded.
- What happens if a search matches heroes across more than one page? Results must still be
  paginated at 10 per page using the same ordering rules.
- What happens when the last hero on a non-first page is deleted or deactivated such that
  the current page becomes empty? The interface must automatically navigate the user back
  to the previous page, which is re-fetched to reflect current server state.
- What happens if a user attempts to submit the create or edit form with a future
  date of birth or otherwise implausible value? The system must reject it server-side with
  a clear validation error, since business rules cannot rely on frontend validation alone.
- What happens if a user submits an avatar URL that does not resolve to a loadable image
  (broken link, non-image content, unreachable host)? The submission must be rejected
  server-side with a clear validation error and the entered values preserved.
- What happens when a user tries to edit or delete a hero that became inactive (e.g. in
  another browser tab) between loading the list and acting on it? The backend must reject
  the operation and the interface must surface the resulting error clearly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a hero record with name, nickname, date of
  birth, universe, main power, and avatar URL.
- **FR-002**: System MUST set a newly created hero's active state to active by default,
  and MUST generate its identifier and creation/update timestamps automatically.
- **FR-003**: System MUST display a paginated list of heroes ordered by creation time,
  newest first, showing exactly 10 heroes per page via server-side pagination.
- **FR-004**: System MUST allow users to search heroes by name or nickname, with matching
  results paginated using the same ordering and page-size rules as the unfiltered list.
  Search results MUST only update when the user explicitly submits the search (e.g. Enter
  key or a Search action), not automatically as the user types.
- **FR-005**: System MUST allow users to open a hero and view all of its fields.
- **FR-006**: System MUST allow users to edit the name, nickname, date of birth, universe,
  main power, and avatar URL of an active hero, while displaying all of its other
  information (read-only) in the same edit view.
- **FR-007**: System MUST prevent editing of an inactive hero, both in what actions the
  interface exposes and as an enforced rule independent of the interface.
- **FR-008**: System MUST allow users to permanently delete an active hero.
- **FR-009**: System MUST prevent deletion of an inactive hero, both in what actions the
  interface exposes and as an enforced rule independent of the interface.
- **FR-010**: System MUST allow users to deactivate an active hero and reactivate an
  inactive hero, changing only its active state and refreshing its updated_at timestamp,
  while leaving name, nickname, date_of_birth, universe, main_power, avatar_url, and
  created_at untouched.
- **FR-011**: System MUST require explicit user confirmation before an activation-state
  change is applied.
- **FR-012**: System MUST require explicit user confirmation before a hero is permanently
  deleted.
- **FR-013**: System MUST visually distinguish inactive heroes (gray appearance) from
  active heroes anywhere they appear in the list.
- **FR-014**: System MUST NOT offer Edit or Delete actions for an inactive hero; an
  inactive hero's only available action is reactivation via its toggle.
- **FR-015**: System MUST prevent a duplicate submission of the same state-changing
  operation (create, edit, activate, deactivate, delete) while one is already pending for
  that hero.
- **FR-015a**: System MUST prevent a create or edit modal from being dismissed (via
  Cancel, backdrop click, or Escape) while its submission is pending. Once no submission
  is pending, the modal MUST be dismissible immediately without requiring confirmation,
  even if it contains unsaved changes.
- **FR-016**: System MUST refresh the displayed hero list to reflect current server state
  after any create, edit, delete, activation, or deactivation operation completes. If the
  operation leaves the user's current page empty, the system MUST automatically navigate
  back to the previous page and refresh it.
- **FR-017**: System MUST provide visible loading feedback for every asynchronous
  operation (list loading, search, create, edit, delete, activation toggle).
- **FR-018**: System MUST provide clear success or error feedback for every operation the
  user performs.
- **FR-019**: System MUST preserve the user's entered values in the create or edit form
  when a submission fails, so the user does not need to re-enter them.
- **FR-020**: System MUST present explicit, distinguishable interface states for: an empty
  hero list, a search with no matching heroes, and a failed request to the backend.
- **FR-021**: System MUST NOT require authentication or authorization for any operation.
- **FR-022**: System MUST enforce all business rules (default active state, edit/delete
  restrictions on inactive heroes, activation affecting only the active state, permanent
  removal on deletion) independently of the interface, such that they hold even if a
  request bypasses the interface.
- **FR-023**: System MUST represent a hero using exactly these fields: id, name, nickname,
  date_of_birth, universe, main_power, avatar_url, is_active, created_at, updated_at — with
  no soft-deletion marker or other additional persisted deletion state.
- **FR-024**: System MUST permanently remove a deleted hero's record such that it can no
  longer be retrieved through any listing, search, or lookup.
- **FR-025**: System MUST verify, server-side, that a submitted avatar URL resolves to a
  loadable image before accepting a create or edit submission, and MUST reject the
  submission with a clear validation error (preserving entered values per FR-019) if the
  URL does not resolve to an image.

### Key Entities

- **Hero**: A record representing a superhero managed by the application. Attributes: a
  unique identifier; name; nickname; date of birth; universe (the fictional setting the
  hero belongs to); main power; avatar URL (image reference); active state (whether the
  hero is currently active or deactivated); creation timestamp; last-updated timestamp.
  A hero's active state governs which operations (edit, delete) may be performed on it,
  independent of the deletion operation itself, which removes the record entirely rather
  than changing its active state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can locate a specific hero by partial name or nickname in under 10
  seconds from the list screen.
- **SC-002**: A user can create a new hero and see it reflected at the top of the list in
  under 3 interactions (open create action, fill form, submit).
- **SC-003**: 100% of create, edit, activate, deactivate, and delete attempts result in
  either a visible success confirmation or a visible, specific error message — none leave
  the user uncertain of the outcome.
- **SC-004**: Attempting to edit or delete an inactive hero is impossible through the
  interface in 100% of cases, and any such request sent directly to the backend is
  rejected in 100% of cases.
- **SC-005**: A user browsing any page of the hero list can visually distinguish active
  from inactive heroes without opening a hero's detail view.
- **SC-006**: After any create, edit, delete, activate, or deactivate action completes,
  the list a user sees matches current server state without requiring a manual page
  refresh.

## Assumptions

- "Universe" is a free-text field describing the fictional setting a hero belongs to
  (e.g. "Marvel", "DC", an original universe) rather than a constrained list, since no
  fixed set of universes was specified.
- "Main power" is a free-text field rather than a selection from a predefined list of
  powers.
- Avatar URL is stored and displayed as a link/reference to an externally hosted image;
  uploading or hosting image files is out of scope. The system verifies the URL resolves
  to a loadable image at submission time (see FR-025); it does not re-verify the image
  remains reachable afterward.
- Date of birth is a calendar date without a time component.
- "Sufficiently large desktop screens" for the five-heroes-per-row layout refers to
  standard desktop/laptop viewport widths; exact breakpoint values are a presentation
  detail left to implementation, not a business rule.
- Search matching is case-insensitive partial matching against name or nickname, since no
  specific matching algorithm was specified and this is the common expectation for a
  search box.
- No maximum limits (e.g. maximum hero count, field length) were specified beyond the
  business rules given; reasonable, generous field-length limits are assumed to prevent
  abuse without constraining legitimate use.
- Concurrent-edit conflict resolution (e.g. two users editing the same hero simultaneously)
  is out of scope beyond the backend rejecting operations that violate current business
  rules (such as editing a hero that has since become inactive).
