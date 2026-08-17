# PM-01 — Refactoring: Booking Sub-System

## 1. Refactoring Goals

The code changes for PM-01 were deliberately structured as refactoring:
behaviour changes are minimal (security fixes), but code structure is improved
so future maintenance is easier.

---

## 2. Extract Validation Middleware (`validateBooking.js`)

**Before:** Validation was absent (no checks at all in the booking controller).

**After:** A dedicated middleware module owns all input-validation rules for
booking creation. The controller only runs if the middleware calls `next()`.

```
Before (booking.controller.js::createBooking):
  ┌─ Controller function ─────────────────────────────────────┐
  │  Presence check (manual if-block)                         │
  │  No range checks                                          │
  │  No date checks                                           │
  │  Business logic (save, notify)                            │
  └───────────────────────────────────────────────────────────┘

After:
  ┌─ validateBookingInput middleware ─────────────────────────┐
  │  Presence check for tour_id                               │
  │  Range check: number_of_persons ∈ [1, 50]                 │
  │  Range check: total_price > 0                             │
  │  Date check: booking_date ≥ today                         │
  └──────────────────────── calls next() ─────────────────────┘
  ┌─ createBooking controller ────────────────────────────────┐
  │  Business logic only (save, notify)                       │
  └───────────────────────────────────────────────────────────┘
```

**Refactoring pattern:** *Extract Function / Extract Middleware*  
**Benefit:** Single Responsibility — the controller no longer mixes validation
with persistence logic. Future rule changes (e.g., max persons = 100) are made
in one place.

---

## 3. Replace req.body.user_id with req.user.id

**Before:**
```js
const { user_id, tour_id, ... } = req.body;
// user_id came from the untrusted client
```

**After:**
```js
const { tour_id, ... } = req.body;
const user_id = req.user.id;   // from verified JWT
```

**Refactoring pattern:** *Replace Magic with Intent* / *Trust Boundary
Enforcement*  
The change makes the code's security contract explicit: ownership is always
derived from the cryptographically verified token, never from the request body.

---

## 4. Ownership Check in deleteBooking

**Before:** controller deleted without checking who the caller was:
```js
await Booking.findByIdAndDelete(id);
```

**After:** fetch-then-check-then-delete:
```js
const booking = await Booking.findById(id);
if (!booking) return res.status(404)...;
if (booking.user_id.toString() !== req.user.id && !req.user.admin)
  return res.status(403)...;
await booking.deleteOne();
```

**Refactoring pattern:** *Guard Clause* — early returns keep the happy path
unindented and readable.  
**Side benefit:** A specific 404 is now returned when the booking does not
exist, rather than silently succeeding (the old `findByIdAndDelete` returned
`null` for non-existent IDs without error).

---

## 5. Middleware Chain Consolidation (booking.route.js)

**Before:** the route file had no middleware at all — security logic was
scattered (some in controllers, some absent).

**After:** each route's security posture is readable at a glance in one file:
```js
router.post("/",          verifyUser,  validateBookingInput, createBooking);
router.get("/",           verifyAdmin, getAllBookings);
router.get("/revenue",    verifyAdmin, getRevenues);
router.get("/user/:userId", verifyUser, getBookingsByUser);
router.delete("/:id",    verifyUser,  deleteBooking);
```

**Refactoring pattern:** *Consolidate Conditional Expression* at the routing
layer. The middleware chain documents the access policy without reading the
controller source.

---

## 6. Code Metrics Before / After

| Metric | Before | After |
|--------|--------|-------|
| Lines with auth logic in `booking.controller.js` | 0 | 4 (deleteBooking guard) |
| Lines of validation in controller | 7 (presence only) | 0 (moved to middleware) |
| Lines in `validateBooking.js` | — | 45 |
| Routes with explicit auth middleware | 0 / 7 | 5 / 7 |
| Cyclomatic complexity of `createBooking` | 3 | 2 (simpler — validation extracted) |
