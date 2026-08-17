# PM-01 — Reverse Engineering: Booking Sub-System

## Objective

Reconstruct the **intended** design and **API contract** for the booking
sub-system from source code alone, without relying on any external
documentation (none exists).

---

## 1. API Contract (reconstructed)

### POST /api/bookings — Create a booking

**Intended behaviour** (reconstructed from model schema + controller logic):

```
POST /api/bookings
Cookie: access_token=<jwt>

Body (application/json):
{
  "tour_id":           "<ObjectId>",   // required
  "booking_date":      "<ISO 8601>",   // required; must be future
  "total_price":       <number>,       // required; must be > 0
  "number_of_persons": <integer>       // required; must be in [1, 50]
}

Success 201:
{
  "success": true,
  "data": { ...Booking document... }
}

Error responses:
  400 — missing fields / bad values
  401 — not authenticated
  500 — server error
```

**Pre-PM-01 actual behaviour** differed: `user_id` was a required body field,
no auth was checked, any numeric value was accepted.

---

### DELETE /api/bookings/:id — Cancel a booking

**Intended behaviour:**
```
DELETE /api/bookings/:id
Cookie: access_token=<jwt>  (owner) OR admin_token=<jwt> (admin)

Success 200: { "success": true, "message": "Booking deleted" }
Error   403: not the booking owner or admin
Error   404: booking not found
```

**Pre-PM-01:** no auth, any caller could delete any booking.

---

## 2. Booking State Machine (from enum constraint in schema)

Reconstructed from `booking.model.js` line 16:
```js
enum: ["pending", "confirmed", "cancelled"]
```
And `updateBookingStatus` in `booking.controller.js` — only admin can call it
via `PUT /:id/status`.

```
[pending] ──(admin confirms)──► [confirmed]
[pending] ──(admin cancels) ──► [cancelled]
[confirmed]──(admin cancels)──► [cancelled]
```
User cancellation is performed via `DELETE /:id` (which removes the document;
soft-cancel via status change is an admin-only operation).

---

## 3. Trust Hierarchy (reconstructed)

```
Unauthenticated  →  read-only tour/blog browsing only
Authenticated User  →  create/read/delete own bookings; submit reviews/blogs
Admin  →  all of the above + manage any booking, tour, user, blog
```

Source evidence:
- `verifyAdmin.js` checks `decoded.admin === true`
- `generateToken(userId, isAdmin)` in `jwt.js` — boolean flag baked into JWT
- `User.role` enum in `user.model.js`: `"user"` | `"admin"`

---

## 4. Notification Architecture (reconstructed)

Every booking event triggers fan-out notifications to all admins. Reconstructed
flow:

```
createBooking()
  → Booking.save()
  → User.find({ role: "admin" })         // O(n_admins) docs loaded
  → Promise.all(admins.map(saveNotif))   // parallel insert
```

No message queue. No retry. Notification delivery is best-effort: if a
notification save fails, the booking is still created (no transaction wrapping
the two operations). This is a **design observation** logged for future
perfective maintenance.

---

## 5. Dependency Graph (booking sub-system)

```
booking.route.js
  ├── booking.controller.js
  │     ├── booking.model.js
  │     ├── user.model.js
  │     ├── tour.model.js
  │     └── notification.model.js
  ├── verifyUser.js         ← added by PM-01
  ├── verifyAdmin.js        ← added by PM-01 (admin-only routes)
  └── validateBooking.js    ← new (PM-01)
```

---

## 6. Design Reconstruction Summary

The booking sub-system was designed with a clear three-tier trust model (anon /
user / admin) and a notification fan-out pattern. The implementation lapsed in
one area: the routing layer was not protected, leaving the controllers exposed.
PM-01 brings the implementation in line with the evident design intent.
