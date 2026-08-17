# Change Request CR-PFM-01
## Tour & Booking Listing — Pagination

| Field            | Value |
|------------------|-------|
| **ID**           | CR-PFM-01 |
| **Date**         | 2026-08-17 |
| **Type**         | Perfective Maintenance |
| **Priority**     | Medium |
| **Raised by**    | Maintenance Team |
| **Status**       | Implemented |

---

## 1. Problem Statement

Two public API endpoints return the **entire** collection on every request:

| Endpoint | Controller function | Collection |
|----------|---------------------|------------|
| `GET /api/tours` | `getAllTours` | `tours` |
| `GET /api/bookings` | `getAllBookings` | `bookings` |

At the current data volume this is acceptable. As the Ghuroo platform grows,
unbounded collection reads will:

1. **Increase response latency** — network transfer and JSON serialization grow
   linearly with the number of documents.
2. **Waste memory** — the full result set is held in Node heap before it is
   sent.
3. **Degrade user experience** — the browser must parse and render thousands of
   tour cards before the first one appears.

This is a **perfective** change: the application is correct today, and we are
making it better (more scalable, more responsive) without changing external
functional behaviour.

---

## 2. Proposed Changes

### 2.1 New file: `api/utils/paginate.js`

Reusable helper that:
- Parses `?page` and `?limit` query parameters with safe defaults (page 1,
  limit 10, max 100).
- Returns `{ page, limit, skip }` for the query layer.
- Provides `paginationEnvelope()` that wraps data in a consistent JSON shape.

### 2.2 `api/controllers/tour.controller.js` — `getAllTours`

Replace `Tour.find().sort(...)` with a parallel
`Promise.all([Tour.find().skip().limit(), Tour.countDocuments()])` so the
total document count is returned alongside the page without an extra round trip.

### 2.3 `api/controllers/booking.controller.js` — `getAllBookings`

Same pattern as above.

---

## 3. API Contract Change

### Before (getAllTours)
```json
{
  "success": true,
  "data": [ ...all tours... ]
}
```

### After (getAllTours)
```json
{
  "success": true,
  "count":      10,
  "page":        1,
  "totalPages":  4,
  "total":      38,
  "data": [ ...10 tours... ]
}
```

`?page` and `?limit` are optional; defaults (1 and 10) preserve
backward-compatible behaviour for consumers that do not yet send them.

---

## 4. Rollback Plan

Git revert of commit on branch `perfective/tour-pagination`. No schema change,
no data migration. Clients that parse `data` directly are unaffected (the
`data` key is still present).

---

## 5. Verification

- `GET /api/tours` → 10 results, `totalPages` > 1 when collection > 10 docs.
- `GET /api/tours?page=2&limit=5` → docs 6–10.
- `GET /api/tours?limit=200` → capped at 100.
- `GET /api/bookings?page=1` → admin receives first 10 bookings.
- Clients reading `response.data` without pagination awareness continue to work.
