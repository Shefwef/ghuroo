# Change Request CR-PM-01
## Booking Controller — Authorization & Input Hardening

| Field            | Value |
|------------------|-------|
| **ID**           | CR-PM-01 |
| **Date**         | 2026-08-17 |
| **Type**         | Preventive Maintenance |
| **Priority**     | High |
| **Raised by**    | Maintenance Team |
| **Status**       | Implemented |

---

## 1. Problem Statement

A proactive audit of `api/controllers/booking.controller.js` and
`api/routes/booking.route.js` revealed three latent defects that have not
yet been exploited in production but will be exploitable without correction:

| # | Location | Risk |
|---|----------|------|
| 1 | `createBooking` — `user_id` sourced from `req.body` | Any authenticated user can create a booking attributed to a different user ID. |
| 2 | `deleteBooking` — no ownership or role check | Any caller that can reach the route can delete any booking. |
| 3 | Booking route — no auth middleware on `POST /` or `DELETE /:id` | Unauthenticated clients (or forged tokens) can reach mutation endpoints. |
| 4 | `number_of_persons` / `total_price` — no range validation | Zero, negative, or absurdly large numbers accepted by the database. |
| 5 | `booking_date` — no future-date enforcement | Past dates accepted silently, corrupting business analytics. |

These are **preventive** fixes: the application is functional today, but the
issues will surface as the user base grows and attackers probe edge cases.

---

## 2. Root Cause

The booking feature was developed rapidly. Auth middleware (`verifyUser`) was
already available in the codebase (used on tour and user routes) but was not
wired into the booking router. Input constraints were validated only at the
MongoDB schema level (type coercion) rather than at the API boundary.

---

## 3. Proposed Changes

### 3.1 New file: `api/utils/validateBooking.js`
Express middleware that validates `number_of_persons`, `total_price`, and
`booking_date` before the controller runs.

### 3.2 `api/controllers/booking.controller.js`
- `createBooking`: replace `user_id = req.body.user_id` with `user_id = req.user.id`
- `deleteBooking`: fetch the booking first, reject with 403 if caller is
  neither the owner nor an admin

### 3.3 `api/routes/booking.route.js`
- `POST /` — add `verifyUser`, `validateBookingInput`
- `GET /` — add `verifyAdmin`
- `GET /revenue` — add `verifyAdmin`
- `GET /user/:userId` — add `verifyUser`
- `DELETE /:id` — add `verifyUser`

---

## 4. Rollback Plan

Git revert of commit on branch `preventive/booking-auth-input-hardening`.
The route changes are isolated to one file; no database migrations required.

---

## 5. Verification

- Existing bookings unaffected (no schema change).
- POST without a valid cookie → 401.
- POST with another user's ID in body → booking is created against the JWT
  owner, not the body value.
- DELETE by a non-owner, non-admin → 403.
- POST with `number_of_persons: 0` → 400.
- POST with `booking_date` yesterday → 400.
