# PFM-01 — Reverse Engineering: Tour Listing API Contract

## Objective

Reconstruct the full API contract and data flow for the tour listing endpoint
from source code — including the implicit performance assumptions made by the
original developer — without any external documentation.

---

## 1. Reconstructed API Contract (before PFM-01)

### GET /api/tours

```
GET /api/tours
Authorization: none required (public endpoint)

Query parameters: none accepted

Response 200:
{
  "success": true,
  "data": [
    {
      "_id":          "<ObjectId>",
      "title":        "<string>",
      "description":  "<string>",
      "itinerary":    "<string | undefined>",
      "price":        <number>,
      "location":     "<string>",
      "duration_days": <number>,
      "is_featured":  <boolean>,
      "thumbnail_url": "<url>",
      "gallery_urls": ["<url>", ...],
      "created_by":   "<ObjectId>",
      "created_at":   "<ISO 8601>"
    },
    ... (all documents, unbounded)
  ]
}
```

**Implicit assumption recovered:** The developer assumed the `tours` collection
would remain small enough to return entirely on every request. This assumption
is embedded in the absence of `.limit()` — a deliberate design choice
(or oversight) that can be recovered only by reading the code, since no
documentation exists.

---

## 2. Implicit Performance Model (reconstructed)

By examining what `.limit()` calls exist vs. don't exist:

| Endpoint | Has .limit()? | Implicit assumption |
|----------|--------------|---------------------|
| `getFeaturedTours` | Yes — `.limit(6)` | Featured set is intentionally small |
| `getRecentReviewsByTour` | Yes — `.limit(5)` | Only recent reviews needed |
| `getAllTours` | **No** | Developer expected the catalogue to stay small |
| `getAllBookings` | **No** | Developer expected admin to see everything |
| `getBookingsByUser` | **No** | A user won't have many bookings |

**Recovery insight:** The pattern of *when* `.limit()` was applied reveals
the developer's mental model. `getFeaturedTours` was always meant to return a
fixed count; `getAllTours` was treated as an admin/debug endpoint that would
always return "everything". As the product moved to production, `getAllTours`
became the primary browse endpoint — the original assumption no longer holds.

---

## 3. Response Envelope Evolution

Before PFM-01, two different response shapes existed in the same controller:

```js
// getAllTours (before)
res.status(200).json({ success: true, data: tours });

// searchTours
res.status(200).json({ success: true, data: tours });

// getFeaturedTours
res.status(200).json({ success: true, data: tours });
```

All identical — no pagination metadata. After PFM-01, `getAllTours` adopts the
richer envelope:

```js
res.status(200).json(paginationEnvelope({ data, total, page, limit }));
// → { success, count, page, totalPages, total, data }
```

This is a forward-compatible extension: the `data` key is preserved.

---

## 4. Dependency Graph Reconstruction

```
GET /api/tours
  └── tour.route.js
        └── tour.controller.js :: getAllTours
              ├── tour.model.js (Tour.find, Tour.countDocuments)
              └── paginate.js (parsePagination, paginationEnvelope)  ← new PFM-01
```

No other controller or model is touched.

---

## 5. Recovered Design Intent

From the text indexes defined in `tour.model.js`:
```js
tourSchema.index({ title: 'text', description: 'text', location: 'text' });
```

The developer planned for full-text search (`searchTours` endpoint uses regex,
not `$text` — the index exists but is not yet used). This confirms the developer
anticipated a growing catalogue. The decision to not paginate `getAllTours` is
therefore an oversight, not a deliberate design choice, consistent with the
interpretation that PM and PFM maintenance are appropriate corrective actions
for the long term.
