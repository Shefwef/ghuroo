# PFM-01 — Refactoring: Tour & Booking Pagination

## 1. Refactoring Goals

Introduce pagination without duplicating logic. The same `page`/`limit`
parsing and response envelope should be used by every list endpoint, so a
single `paginate.js` utility owns the pattern.

---

## 2. Extract Utility: `paginate.js`

**Pattern:** *Extract Function* (Fowler's Refactoring Catalog)

Before PFM-01, each controller that needed limits had ad-hoc code:
```js
// getFeaturedTours (ad hoc, fixed limit)
.limit(6)

// getRecentReviewsByTour (ad hoc, fixed limit)
.limit(5)
```

There was no reusable utility for query-driven pagination. PFM-01 introduces
one:

```js
// paginate.js
export const parsePagination = (req) => { ... };   // reads ?page, ?limit from query
export const paginationEnvelope = ({ data, total, page, limit }) => ({ ... });
```

Any future endpoint that needs pagination imports two functions and is done.

---

## 3. getAllTours Refactoring

**Before:**
```js
export const getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    next(error);
  }
};
```

**After:**
```js
export const getAllTours = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [tours, total] = await Promise.all([
      Tour.find().sort({ created_at: -1 }).skip(skip).limit(limit),
      Tour.countDocuments(),
    ]);
    res.status(200).json(paginationEnvelope({ data: tours, total, page, limit }));
  } catch (error) {
    next(error);
  }
};
```

**Refactoring patterns applied:**
- *Extract Function* — pagination logic moved to `paginate.js`
- *Parallel Queries* — `Promise.all` runs the data fetch and count concurrently,
  avoiding two sequential round-trips to MongoDB
- *Consistent Return Shape* — `paginationEnvelope` guarantees the same JSON
  structure regardless of which endpoint calls it

---

## 4. getAllBookings Refactoring

Same pattern applied to the admin booking list:

**Before:**
```js
const bookings = await Booking.find()
  .populate("tour_id", "title")
  .populate("user_id", "full_name")
  .sort({ createdAt: -1 });
res.json({ success: true, data: bookings });
```

**After:**
```js
const { page, limit, skip } = parsePagination(req);
const [bookings, total] = await Promise.all([
  Booking.find()
    .populate("tour_id", "title")
    .populate("user_id", "full_name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
  Booking.countDocuments(),
]);
res.json(paginationEnvelope({ data: bookings, total, page, limit }));
```

---

## 5. Code Metrics Before / After

| Metric | Before | After |
|--------|--------|-------|
| Lines to add pagination in a new endpoint | N/A (no pattern) | 3 (import + 2 calls) |
| Duplicated limit-handling logic | N/A | 0 — in `paginate.js` |
| `getAllTours` response consistency with other paginated endpoints | N/A | Identical envelope |
| Parallel DB round-trips per list request | 1 (data only) | 2 parallel (data + count = same wall time as 1) |
| Max documents loaded into Node heap per list request | Unbounded | 100 (MAX_LIMIT) |

---

## 6. Future Refactoring Opportunities Identified

1. `getFeaturedTours` uses a hardcoded `.limit(6)` — could be made configurable
   via a query param if the home page design changes.
2. `getReviewsByTour` returns all reviews for a tour with no limit — same
   pattern as `getAllTours`; candidate for PFM-02.
3. MongoDB text search (`$text`) should replace regex search in `searchTours`
   to use the existing text index — candidate for PFM-03.
