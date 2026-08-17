# PM-01 — Impact Analysis: Booking Authorization & Input Hardening

## 1. Change Summary

Three files changed, one new file added:

| File | Nature of change |
|------|-----------------|
| `api/routes/booking.route.js` | Middleware added to 5 routes |
| `api/controllers/booking.controller.js` | `user_id` source changed; `deleteBooking` ownership check added |
| `api/utils/validateBooking.js` | **New** — input validation middleware |

---

## 2. Backend Impact

### 2.1 Routes affected

| Route | Before | After |
|-------|--------|-------|
| `POST /api/bookings` | Open (no auth) | `verifyUser` + `validateBookingInput` required |
| `GET /api/bookings` | Open | `verifyAdmin` required |
| `GET /api/bookings/revenue` | Open | `verifyAdmin` required |
| `GET /api/bookings/user/:userId` | Open | `verifyUser` required |
| `DELETE /api/bookings/:id` | Open | `verifyUser` + ownership check required |

### 2.2 Controller behaviour changes

**`createBooking`**
- `user_id` previously: `req.body.user_id`
- `user_id` now: `req.user.id` (JWT-derived)
- Effect: existing front-end code that sends `user_id` in the body still works
  (the field is now silently ignored rather than trusted).

**`deleteBooking`**
- Previously: deletes any booking by ID, no ownership check
- Now: fetches booking first; returns 404 if not found, 403 if caller is
  neither the owner nor an admin
- Extra DB read per delete (one `findById` before `deleteOne`): negligible at
  current scale

---

## 3. Frontend Impact

Identified all client-side `fetch` calls that hit booking endpoints:

```
grep -rn "api/bookings" client/src
```

Key callers:
| File | Call | Impact |
|------|------|--------|
| `BookingPage.jsx` (or equivalent) | `POST /api/bookings` | Must send valid cookie; user_id in body is now ignored — no change needed |
| `UserBookings.jsx` | `GET /api/bookings/user/:userId` | Must send cookie — already done via `credentials: 'include'` |
| Admin dashboard | `GET /api/bookings`, `GET /api/bookings/revenue` | Uses admin session — unaffected |
| Cancel/delete | `DELETE /api/bookings/:id` | Must send cookie; owner or admin only |

**No frontend code changes required.** The React app already sends cookies
with every request (`credentials: 'include'`). The only behavioural change
visible to the client is that unauthenticated DELETE requests now receive 401
instead of silently succeeding.

---

## 4. Database Impact

- **Schema unchanged.** `booking.model.js` is not modified.
- Existing booking documents are unaffected.
- The new validation prevents a class of malformed documents from being
  inserted in future (e.g., `number_of_persons: -5`).

---

## 5. Security Impact (positive)

| Threat | Before | After |
|--------|--------|-------|
| User impersonation via `user_id` in body | Exploitable | Mitigated (JWT enforced) |
| Unauthenticated booking creation | Exploitable | Mitigated (401) |
| Arbitrary booking deletion | Exploitable | Mitigated (403 for non-owner) |
| Negative person count in DB | Possible | Rejected at API boundary |
| Past booking date | Accepted | Rejected with descriptive 400 |

---

## 6. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Existing legitimate client breaks | Low — client already sends cookies | Monitor 401 rate in logs post-deploy |
| Admin workflow disrupted | None — admin routes require `verifyAdmin` which was already used elsewhere | Smoke test admin booking panel |
| Performance regression | Negligible — one extra DB read on DELETE | Profile under load if needed |
