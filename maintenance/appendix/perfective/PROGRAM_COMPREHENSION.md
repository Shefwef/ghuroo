# PFM-01 — Program Comprehension: Tour Listing Performance

## Objective

Understand how the tour listing endpoint works today and quantify why
unbounded collection reads are a scalability concern worth addressing
proactively.

---

## 1. Current Code Path (before PFM-01)

```
Client: GET /api/tours
  ▼
tour.route.js: router.get("/", getAllTours)
  ▼
tour.controller.js :: getAllTours()
  │
  ├── Tour.find().sort({ created_at: -1 })
  │     • No .limit()
  │     • No .skip()
  │     • Loads ALL documents from the `tours` collection into Node heap
  │
  └── res.status(200).json({ success: true, data: tours })
        • Serializes every tour document to JSON
        • Sends entire payload over the wire
```

---

## 2. Growth Projection

| Tours in DB | Est. document size | Payload size | Typical serialization time |
|-------------|-------------------|--------------|---------------------------|
| 100         | ~2 KB each        | ~200 KB      | < 10 ms |
| 1 000       | ~2 KB each        | ~2 MB        | ~50 ms |
| 10 000      | ~2 KB each        | ~20 MB       | ~500 ms |
| 100 000     | ~2 KB each        | ~200 MB      | memory pressure, OOM risk |

At 100 tours (today) the endpoint is fast. At 10 000 tours (plausible within
2 years for a production platform) response time degrades significantly and
server memory spikes on every browse-page load.

---

## 3. Tour Model Fields Reviewed

From `api/models/tour.model.js`:

| Field | Type | Approx size |
|-------|------|-------------|
| title | String | ~50 bytes |
| description | String | ~500 bytes |
| itinerary | String | ~1 KB |
| price | Number | 8 bytes |
| location | String | ~30 bytes |
| duration_days | Number | 8 bytes |
| is_featured | Boolean | 1 byte |
| thumbnail_url | String (URL) | ~100 bytes |
| gallery_urls | [String] | ~100 bytes × n images |
| created_by | ObjectId | 12 bytes |
| created_at | Date | 8 bytes |

Gallery URLs inflate the document size most. A tour with 10 gallery images is
~2 KB; loading 10 000 such tours = 20 MB per request — well above acceptable
API payload size.

---

## 4. Existing Pagination Patterns in the Codebase

`getFeaturedTours` already uses `.limit(6)` — the developer understood the
pattern for that specific use case but did not apply it to the general listing.

`getRecentReviewsByTour` uses `.limit(5)`.

**Comprehension insight:** the pattern exists; it is just inconsistently
applied. PFM-01 formalises it into a reusable utility so all future listing
endpoints adopt it from the start.

---

## 5. Client-Side Impact Assessment

Identified frontend files that call `GET /api/tours`:

```
grep -rn "/api/tours" client/src
```

Relevant callers:
| File | What it does with the response |
|------|-------------------------------|
| `Tours.jsx` | Maps `response.data.data` to render tour cards |
| `Home.jsx` | Likely uses featured tours endpoint, not getAllTours |
| `AdminTours.jsx` | Admin management table |

**Key finding:** React components access `response.data.data` (the array).
After PFM-01, the `data` key is still present at the same path — no component
change required for read-only display. Components that need to show "showing
page X of Y" can optionally consume the new `page`/`totalPages` fields.

---

## 6. Comprehension Summary

The `getAllTours` endpoint was written assuming the collection stays small.
That assumption breaks at scale. The fix is surgical — two lines of
`.skip(skip).limit(limit)` and a `countDocuments()` call — but the
program-comprehension step shows *why* those two lines matter and what the
growth trajectory looks like without them.
