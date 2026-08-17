# PM-01 — Program Comprehension: Booking Sub-System

## Objective

Before hardening the booking sub-system we need to understand precisely how a
booking request travels from the browser to the database and what trust
boundaries exist (or should exist) along the way.

---

## 1. Booking Sub-System Data Flow

```
Browser (React)
  │
  │  POST /api/bookings   { tour_id, booking_date, total_price,
  │                          number_of_persons, user_id }   ← user_id from
  │                                                           localStorage (unsafe)
  ▼
Express Router  →  booking.route.js
  │   (no auth middleware before PM-01)
  ▼
booking.controller.js :: createBooking()
  ├── reads user_id from req.body               ← TRUST BOUNDARY VIOLATION
  ├── creates Booking document
  ├── fetches Tour + User for notification
  └── saves Notification for every admin
```

After PM-01 the corrected flow is:

```
Browser
  │  POST /api/bookings  { tour_id, booking_date, total_price, number_of_persons }
  ▼
verifyUser middleware  →  decodes JWT cookie → attaches req.user
  ▼
validateBookingInput middleware  →  rejects bad ranges / past dates
  ▼
createBooking()
  └── user_id = req.user.id  (from verified JWT, cannot be forged)
```

---

## 2. Files Involved

| File | Role |
|------|------|
| `api/routes/booking.route.js` | Wires HTTP verbs to middleware chain |
| `api/controllers/booking.controller.js` | Business logic for all booking operations |
| `api/utils/verifyUser.js` | JWT cookie verification; populates `req.user` |
| `api/utils/verifyAdmin.js` | Admin-only JWT verification |
| `api/utils/validateBooking.js` | **New (PM-01)** — input range/date validation |
| `api/models/booking.model.js` | Mongoose schema for Booking collection |
| `api/utils/error.js` | Factory for HTTP error objects consumed by Express error handler |

---

## 3. Booking State Machine (reverse-engineered from schema enum)

```
         ┌─────────┐
  create │ pending │ ──── admin confirms ──►  ┌───────────┐
         └─────────┘                          │ confirmed │
               │                              └───────────┘
               │ admin rejects                      │
               ▼                                    │ admin cancels
         ┌───────────┐ ◄──────────────────────────────┘
         │ cancelled │
         └───────────┘
```

Allowed `status` values: `pending` | `confirmed` | `cancelled`  
Transitions are performed via `PUT /api/bookings/:id/status` (admin only).

---

## 4. Auth Model Summary

| Middleware | Token source | Sets | Used on |
|------------|-------------|------|---------|
| `verifyUser` | `access_token` cookie | `req.user.id`, `req.user.admin` | User-facing mutations |
| `verifyAdmin` | `admin_token` or `access_token` cookie, or `Authorization: Bearer` header | `req.user.id`, `req.user.admin` | Admin-only routes |

Before PM-01: `POST /api/bookings` and `DELETE /api/bookings/:id` had **no middleware**, so
`req.user` was `undefined` inside the controller — the controller compensated
by trusting `req.body.user_id`, creating the impersonation hole.

---

## 5. Key Insight

The `verifyUser` and `verifyAdmin` utilities already exist and are applied
consistently on tour and user routes. The booking route was simply overlooked
during the feature's initial development. This is a structural comprehension
finding: the pattern exists; it was not applied uniformly.
