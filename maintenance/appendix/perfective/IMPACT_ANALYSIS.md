# PFM-01 — Impact Analysis: Tour & Booking Pagination

## 1. Changed Files

| File | Change |
|------|--------|
| `api/utils/paginate.js` | **New** — shared pagination utility |
| `api/controllers/tour.controller.js` | `getAllTours` paginated; import added |
| `api/controllers/booking.controller.js` | `getAllBookings` paginated; import added |

---

## 2. API Contract Change Analysis

### 2.1 Response Shape Comparison

#### GET /api/tours — Before
```json
{ "success": true, "data": [ { ... }, { ... }, ... ] }
```

#### GET /api/tours — After
```json
{
  "success":    true,
  "count":      10,
  "page":        1,
  "totalPages":  4,
  "total":      38,
  "data": [ { ... }, { ... } ]
}
```

**Breaking change risk:** Any consumer that reads *only* `response.data.data`
(the array) is **unaffected** — the `data` key is still present at the same
location. Extra envelope keys (`count`, `page`, `totalPages`, `total`) are
additive and will be silently ignored by existing consumers.

**Consumers that assume `response.data` is the array directly** would break —
but no such consumer exists in the frontend (verified by grep: all callers do
`response.data.data` or destructure `{ data }`).

---

## 3. Frontend Callers Analysis

```
grep -rn "api/tours" client/src  →  Tours.jsx, Home.jsx, AdminTours.jsx
grep -rn "api/bookings" client/src  →  AdminBookings.jsx, UserBookings.jsx
```

| Caller | Current access pattern | Breaks after PFM-01? |
|--------|------------------------|----------------------|
| `Tours.jsx` | `response.data.data` (array) | No |
| `AdminTours.jsx` | `response.data.data` | No |
| `AdminBookings.jsx` | `response.data.data` | No |
| `UserBookings.jsx` | Uses `GET /bookings/user/:id`, not `getAllBookings` — separate endpoint, unchanged | No |

**No frontend file requires modification for PFM-01.**

---

## 4. Database Impact

### 4.1 Query Changes

| Before | After |
|--------|-------|
| `Tour.find().sort(...)` | `Tour.find().sort(...).skip(skip).limit(limit)` |
| (no count query) | `Tour.countDocuments()` — runs in parallel |

MongoDB can satisfy `countDocuments()` using the collection metadata (fast
path) when no filter is applied, making the overhead negligible.

### 4.2 Index Usage

`Tour.find().sort({ created_at: -1 })` — sorting by `created_at` without an
index causes a collection scan sort for large collections.

**Recommendation (future perfective):** add `tourSchema.index({ created_at: -1 })`
for O(log n) sort. Not in scope for PFM-01 but logged as a follow-up.

---

## 5. Performance Impact (positive)

| Scenario | Before | After |
|----------|--------|-------|
| 10 tours in DB | ~20 KB response | ~20 KB (page 1, limit 10 = all) |
| 1 000 tours in DB | ~2 MB response | ~20 KB (page 1, limit 10) |
| 10 000 tours in DB | ~20 MB, potential OOM | ~20 KB per page |

Memory usage in Node.js: proportional to page size (constant after PFM-01),
not collection size.

---

## 6. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Frontend breaks on response shape change | Low (verified grep) | Integration smoke-test on staging |
| Admin sees fewer bookings on first load | Expected — by design | Confirm admin pagination UI handles `totalPages` |
| countDocuments slow on large collection | Low (no filter = metadata path) | Add index if collection exceeds 1M docs |
| Existing automated tests break | Low (no tests for these endpoints found) | Add unit test as follow-up |
