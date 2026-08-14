# API Contract: Heroes

Base path: `/heroes`. No authentication. All responses are JSON. All request bodies are
JSON. Content-Type: `application/json`.

## Hero representation

```jsonc
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Peter Parker",
  "nickname": "Spider-Man",
  "date_of_birth": "1995-08-10",
  "universe": "Marvel",
  "main_power": "Wall-crawling and spider-sense",
  "avatar_url": "https://example.com/avatars/spider-man.png",
  "is_active": true,
  "created_at": "2026-08-01T12:00:00.000Z",
  "updated_at": "2026-08-01T12:00:00.000Z"
}
```

Exactly these ten fields (FR-023). No `deleted_at` or other field is ever present.

## Error representation

All non-2xx responses share this shape:

```jsonc
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Cannot edit an inactive hero"
}
```

For validation failures (`400`), `message` MAY be an array of field-level messages:

```jsonc
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "name should not be empty",
    "avatarUrl must resolve to a loadable image"
  ]
}
```

No Prisma/MySQL/framework internals are ever included in an error response.

---

## `POST /heroes`

Create a hero. Always created active.

**Request body**:

```jsonc
{
  "name": "Peter Parker",
  "nickname": "Spider-Man",
  "date_of_birth": "1995-08-10",
  "universe": "Marvel",
  "main_power": "Wall-crawling and spider-sense",
  "avatar_url": "https://example.com/avatars/spider-man.png"
}
```

| Status | When |
|---|---|
| `201 Created` | Hero created; body is the full hero representation |
| `400 Bad Request` | Missing/invalid field(s), including a non-image `avatar_url` |

---

## `GET /heroes`

List heroes, paginated, optionally filtered by search.

**Query parameters**:

| Param | Type | Required | Notes |
|---|---|---|---|
| `page` | integer ≥ 1 | No, default `1` | |
| `limit` | integer | No, default `10`, fixed at `10` for this feature | Present for forward-compatibility; server MAY reject other values or clamp to 10 |
| `search` | string | No | Case-insensitive substring match against `name` OR `nickname` |

**Response body** (`200 OK`):

```jsonc
{
  "data": [ /* hero representation, ... up to 10 items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Ordering: `created_at` descending (newest first), stable via `id` descending tiebreak.

| Status | When |
|---|---|
| `200 OK` | Always, including empty results (`data: []`) |
| `400 Bad Request` | Invalid `page` (e.g. non-positive, non-numeric) |

---

## `GET /heroes/:id`

Retrieve a single hero's full details.

| Status | When |
|---|---|
| `200 OK` | Hero found; body is the full hero representation |
| `404 Not Found` | No hero with that `id` |

---

## `PATCH /heroes/:id`

Edit an **active** hero's editable fields. Rejects inactive heroes.

**Request body** (any subset of the editable fields; unspecified fields are unchanged):

```jsonc
{
  "name": "Peter B. Parker",
  "nickname": "Spider-Man",
  "date_of_birth": "1995-08-10",
  "universe": "Marvel (Earth-616)",
  "main_power": "Wall-crawling and spider-sense",
  "avatar_url": "https://example.com/avatars/spider-man-v2.png"
}
```

Only `name`, `nickname`, `date_of_birth`, `universe`, `main_power`, `avatar_url` are
accepted; any other field in the body is ignored. `is_active` MUST NOT be changed by this
endpoint.

| Status | When |
|---|---|
| `200 OK` | Hero updated; body is the full updated hero representation |
| `400 Bad Request` | Invalid field value(s), including a non-image `avatar_url` |
| `404 Not Found` | No hero with that `id` |
| `409 Conflict` | Hero exists but is currently inactive — edit rejected |

---

## `PATCH /heroes/:id/status`

Change only a hero's `is_active` value (activate or deactivate).

**Request body**:

```jsonc
{ "is_active": false }
```

| Status | When |
|---|---|
| `200 OK` | Status updated; body is the full updated hero representation (`updated_at` refreshed) |
| `400 Bad Request` | `is_active` missing or not boolean |
| `404 Not Found` | No hero with that `id` |

Note: unlike edit/delete, this endpoint is valid regardless of current state — it is the
only operation always available on an inactive hero (to reactivate it).

---

## `DELETE /heroes/:id`

Permanently delete an **active** hero. Rejects inactive heroes. No soft delete.

| Status | When |
|---|---|
| `204 No Content` | Hero permanently removed |
| `404 Not Found` | No hero with that `id` |
| `409 Conflict` | Hero exists but is currently inactive — deletion rejected |
