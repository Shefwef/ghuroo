# Report Context — Software Maintenance Simulation on Ghuroo

> **Purpose of this file:** One-stop reference for writing the formal lab
> report. Contains definitions, the narrative, code excerpts, before/after
> comparisons, tool justifications, and a finding for every required
> activity. Update this file as the project evolves.

---

## 1. Project Under Maintenance

| Item | Detail |
|------|--------|
| **Project name** | Ghuroo |
| **Type** | Full-stack MERN web application |
| **Domain** | Travel & tourism — tour listings, bookings, reviews, blogs |
| **Repository** | https://github.com/Shefwef/ghuroo |
| **Live URL** | https://ghuroo.onrender.com |
| **Tech stack** | MongoDB · Express.js · React (Vite) · Node.js |
| **Auth** | JWT cookie (server-issued) + Google OAuth via Firebase (client-side) |
| **Storage** | Supabase (images), MongoDB Atlas (data) |
| **Deployment** | Single Render web service — one Node process serves both API and SPA |

### Architecture (one-liner per layer)

```
Browser  →  React SPA (client/src/)  →  fetch("/api/...")  →  Express router
Express router  →  Controller  →  Mongoose model  →  MongoDB Atlas
```

### Key source files referenced in this report

| File | Purpose |
|------|---------|
| `api/index.js` | Server entry point — CORS, middleware, route registration |
| `api/routes/booking.route.js` | Booking HTTP route definitions |
| `api/controllers/tour.controller.js` | Tour CRUD + search logic |
| `api/controllers/booking.controller.js` | Booking CRUD |
| `api/controllers/blog.controller.js` | Blog search |
| `api/utils/escapeRegex.js` | **CM-01** — regex sanitization utility |
| `api/utils/validateBooking.js` | **PM-01** — booking input validation middleware |
| `api/utils/paginate.js` | **PFM-01** — pagination helper |
| `api/utils/verifyUser.js` | JWT verification middleware for regular users |
| `api/utils/verifyAdmin.js` | JWT verification middleware for admins |

---

## 2. Maintenance Category Definitions

### What is software maintenance?

Software maintenance (IEEE 14764) is the process of modifying a software
product after delivery to correct faults, improve performance, or adapt it to
a changed environment.

### The Four Categories

| # | Category | IEEE Definition (simplified) | Trigger | Example in this project |
|---|----------|------------------------------|---------|------------------------|
| 1 | **Corrective** | Fix a defect in the delivered product | Bug discovered / reported | ReDoS vulnerability in search (CM-01) |
| 2 | **Adaptive** | Modify to remain usable as environment changes | External change (platform, dependency, regulation) | CORS hardcoded to one origin (AM-01) |
| 3 | **Preventive** | Modify to detect and correct latent faults before they become failures | Proactive audit / risk assessment | Booking routes had no authentication (PM-01) |
| 4 | **Perfective** | Improve performance, maintainability, or other attributes without fixing a bug | Quality initiative / growth planning | Unbounded DB queries need pagination (PFM-01) |

### The Five Maintenance Activities (performed for each category)

| Activity | What it means | What to produce |
|----------|--------------|-----------------|
| **Program Comprehension** | Read and understand the code before touching it — data flow, dependencies, architecture | Dependency graphs, AST traces, data-flow diagrams |
| **Change Management** | Formal process of planning, approving, and tracking the change | Change Request document, dedicated git branch, commit with traceability |
| **Impact Analysis** | Determine what else is affected before making the change | List of affected files, clients, APIs; regression risk assessment |
| **Reverse Engineering** | Recover design-level understanding from code alone (no external docs) | API contracts, state machines, architecture diagrams reconstructed from source |
| **Refactoring** | Restructure code to improve design without changing external behaviour | Named patterns (Extract Function, Guard Clause, etc.), before/after code |

---

## 3. Maintenance Simulation — All Four Categories

---

### CATEGORY 1 — Corrective Maintenance (CM-01)

**Change ID:** CM-01  
**Date:** 2026-07-10  
**Branch:** `corrective/tour-blog-search-regex-sanitization`  
**Commits:** `e841e93`, `68ea47c`  
**Defect type:** Security — ReDoS (CWE-1333) + crash (CWE-20)

#### What the bug was

The tour and blog search endpoints built a MongoDB `$regex` query by directly
inserting the raw URL parameter, with no escaping:

```js
// BEFORE — api/controllers/tour.controller.js (pre-CM-01)
const { term } = req.params;
const searchQuery = {
  $or: [
    { title:       { $regex: term, $options: "i" } },  // ← term is raw user input
    { description: { $regex: term, $options: "i" } },
    { location:    { $regex: term, $options: "i" } },
  ],
};
```

**Two failure modes:**

1. **Crash / HTTP 500** — search terms containing invalid regex syntax
   (e.g., `C++ tour`) throw `SyntaxError: Invalid regular expression`.
2. **ReDoS** — a crafted term like `(a+)+$` triggers catastrophic
   backtracking. Measured: a 26-character crafted input took **2089ms**;
   a 34-character input would take minutes, blocking the event loop for all
   other users (unauthenticated, public route — zero barrier to attack).

**Affected endpoints (all public, no auth required):**
- `GET /api/tours/search/:term` — `searchTours()`
- `GET /api/tours/location/:location` — `getToursByLocation()`
- `GET /api/blogs/search/:term` — `searchBlogs()`

#### Activity 1 — Program Comprehension

**Technique used:** History-guided triage + AST taint-flow analysis + grep-based pattern search.

1. `git log` showed the search feature was recently added (`050173c`) — new
   user-input-handling code is always the highest-priority audit target.
2. `madge` (JS dependency graph tool) confirmed the import chain:
   `tour.route.js → tour.controller.js → tour.model.js` — one straight
   line, no shared code with other controllers.
3. `espree` parsed the pre-fix `searchTours` function into an AST. An
   annotated depth-first walk flagged the taint source (`req.params.term`)
   and three `$regex` sinks in one function:

   ```
   Identifier  <-- tainted source (raw req.params.term)
   ...
   Property    <-- SINK: value handed to MongoDB $regex without sanitization
   ```

4. `grep -rn '\$regex' api` found **four sinks across two files** — not
   just the one that was visually obvious.
5. ESLint (run with a maintenance-local config since `api/` had none) found
   additional code smells: duplicate `role` key in auth responses, unused
   variables — logged to backlog, not fixed in this cycle.

**Key comprehension finding:** The `Hero.jsx` component in the frontend has
its own search bar with **no `onSubmit` handler** — it is completely dead
code. The real search form is in `Home.jsx`. This prevented wasted effort
tracing `Hero.jsx`'s UI.

#### Activity 2 — Change Management

**Change Request:** `maintenance/appendix/corrective/change-management/CR-2026-07-10-01.md`

| Field | Value |
|-------|-------|
| Severity | High |
| Priority | P2 (fix before next deploy) |
| Rollback | `git revert e841e93` — additive change, no data migration |

**Branch:** `git checkout -b corrective/tour-blog-search-regex-sanitization`

**Fix:** New utility `api/utils/escapeRegex.js`, applied at all four sinks:

```js
// api/utils/escapeRegex.js
export const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

```js
// AFTER — tour.controller.js
const safeTerm = escapeRegex(term);
const searchQuery = {
  $or: [
    { title:       { $regex: safeTerm, $options: "i" } },
    { description: { $regex: safeTerm, $options: "i" } },
    { location:    { $regex: safeTerm, $options: "i" } },
  ],
};
```

**Verification gates before merging:**
- `node --check` on all modified files
- `node maintenance/appendix/corrective/repro-regex-bug.mjs` — shows CRASH
  before, all OK after
- ReDoS profiling: 2089ms → 0.001ms

#### Activity 3 — Impact Analysis

**Backend:** only `tour.route.js` and `blog.route.js` import the affected
controllers (confirmed by `madge` reverse-dependency query). No service
layer or shared module is involved.

**Frontend callers (grep-verified):**

| Endpoint | Caller |
|----------|--------|
| `/api/tours/search/:term` | `Home.jsx`, `Tours.jsx` |
| `/api/tours/location/:location` | `DestinationDetails.jsx` |
| `/api/blogs/search/:term` | **None** — dead route from UI perspective |

**Response shape:** unchanged — `{ success: true, data: [...] }`. Legitimate
searches (no regex metacharacters) return identical results before and after.

**ReDoS timing table (from Python `cProfile` + SnakeViz):**

| Crafted input length | Before fix | After fix |
|---------------------:|------------|-----------|
| n = 10 | 0.103 ms | 0.071 ms |
| n = 20 | 30.505 ms | 0.001 ms |
| n = 26 | **2089.194 ms** | 0.001 ms |

#### Activity 4 — Reverse Engineering

**Reconstructed API contract** (no Swagger/OpenAPI exists):

```
GET /api/tours/search/:term
  Auth: none
  Response: { success: true, data: Tour[] }
  Note: if term is numeric, also matches price and duration_days
  Pre-fix: 500 on regex-invalid input; ReDoS on crafted input
  Post-fix: metacharacters matched literally, safe for all inputs
```

**JSDoc documentation** generated from `api/controllers`, `api/models`,
`api/routes`, `api/utils`:
```bash
npx jsdoc -r api/controllers api/models api/routes api/utils \
  -d maintenance/appendix/corrective/jsdoc/html
```
Open `maintenance/appendix/corrective/jsdoc/html/index.html` to view.

**IDA Pro analog:** Grepped the minified production bundle
(`client/dist/assets/index-71cf8e48.js`) for hardcoded backend URLs —
all backend calls are same-origin relative paths, no origin is baked
into the compiled bundle.

#### Activity 5 — Refactoring

**Pattern: Extract Function**

Before: the escaping logic would have been inlined at four call sites in
two different files — duplication and no named abstraction.

After: `escapeRegex()` in a dedicated utility file, matching the existing
one-function-per-file convention (`error.js`, `jwt.js`, etc.). Future `$regex`
uses anywhere in the codebase can import the same function.

**Deliberately out of scope** (backlog):
- Duplicate `role` key in auth responses
- Unused `previousBooking` variable in `updateBookingStatus`
- Dead `Hero.jsx` import in `Home.jsx`

**Run the demo:**
```bash
node maintenance/appendix/corrective/repro-regex-bug.mjs
```

---

### CATEGORY 2 — Adaptive Maintenance (AM-01)

**Change ID:** AM-01  
**Date:** 2026-07-10  
**Branch:** `adaptive/env-driven-cors-and-runtime-pinning`  
**Commit:** `0a1a026`  
**Trigger:** Anticipated environment change — not a bug

#### What the problem was

`api/index.js` hardcoded the CORS allow-list to exactly one origin per
`NODE_ENV`:

```js
// BEFORE — api/index.js (pre-AM-01)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ["https://ghuroo.onrender.com"]   // hardcoded
    : "http://localhost:5173",           // hardcoded
  credentials: true,
}));
```

**The problem:** The moment a second origin is needed (custom domain
`ghuroo.app`, staging subdomain, Vercel preview URL for frontend-only
deploy), every one of the **27 files / 50 fetch() call sites** in the
client starts failing with a browser CORS error — with no fix possible
without a code change and full redeploy.

This is **adaptive** because the application is correct today. The operating
environment is expected to change (scaling, custom domains, staging) and the
code is not ready for that change.

#### Activity 1 — Program Comprehension

**Key findings:**

1. **Single CORS gate:** CORS is configured in exactly one place —
   `api/index.js` line ~53. The entire 50-call-site frontend funnel passes
   through this one middleware.
2. **Client never hardcodes a backend origin:** Every frontend call uses a
   same-origin relative path (`fetch("/api/...")`). Confirmed by reading
   `client/src` AND independently by grepping the compiled production bundle.
3. **Unused `firebase-admin`:** Declared in `package.json` but `grep -ri firebase api/` returns zero hits — bloating install size for no benefit. Logged, not fixed.
4. **No `engines` field:** `package.json` had no Node version constraint, so
   Render's automatic Node upgrade could silently break the app.
5. **Sizing the blast radius:** `madge` on `client/src` → 42 modules; grep
   for `fetch(` + `/api` → 50 call sites across 27 files. All protected by
   the single CORS gate being changed.

#### Activity 2 — Change Management

**Change Request:** `maintenance/appendix/adaptive/change-management/CR-2026-07-10-02.md`

| Field | Value |
|-------|-------|
| Severity | Medium |
| Priority | P3 (proactive, no current breakage) |
| Rollback | `git revert 0a1a026` — config-only, no data migration |

**Changes made:**

```js
// AFTER — api/index.js (AM-01)
const defaultOrigins = process.env.NODE_ENV === "production"
  ? ["https://ghuroo.onrender.com"]
  : ["http://localhost:5173"];

// ALLOWED_ORIGINS is comma-separated, e.g.:
// "https://ghuroo.onrender.com,https://ghuroo.app,https://staging.ghuroo.com"
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : defaultOrigins;   // falls back to old behaviour when unset

app.use(cors({ origin: allowedOrigins, credentials: true }));
```

Also added:
- `"engines": { "node": ">=18" }` to `package.json` (evidence-based: `firebase-admin` already declared `>=18`)
- `api/.env.example` — documents the full env var contract

#### Activity 3 — Impact Analysis

**Regression check (critical):** With `ALLOWED_ORIGINS` unset, does the
new code behave identically to the old hardcoded code?

Live HTTP test result:
```
OLD config:
  ghuroo.onrender.com → access-control-allow-origin: ghuroo.onrender.com  ✓
  ghuroo.app          → (absent = blocked)                                 ✓

NEW config (ALLOWED_ORIGINS unset):
  ghuroo.onrender.com → access-control-allow-origin: ghuroo.onrender.com  ✓ (same)
  ghuroo.app          → (absent = blocked)                                 ✓ (same)

NEW config (ALLOWED_ORIGINS set):
  ghuroo.onrender.com → access-control-allow-origin: ghuroo.onrender.com  ✓
  ghuroo.app          → access-control-allow-origin: ghuroo.app           ✓ (new capability)
```

Frontend: zero changes needed. Client was never origin-aware.  
Database/schema: unchanged.  
Operations: adding a new deployment origin now requires only a Render
dashboard env var update — no code change, no redeploy-with-new-source.

#### Activity 4 — Reverse Engineering

**Deployment topology** reconstructed from source code alone (no
architecture doc exists):

```
Browser  →  Render Web Service (single Node process)
              ├── Express static: serves client/dist/
              └── Express /api/*: all backend routes
                  ├── MongoDB Atlas (MONGO_URL)
                  ├── Supabase Storage (image uploads)
                  └── Firebase Auth (client-side OAuth only)
```

Confirmed by reading:
- `api/index.js` → `express.static` + catch-all `sendFile`
- `api/config/db.js` → `mongoose.connect(process.env.MONGO_URL)`
- `api/utils/supabaseStorage.js` → `@supabase/supabase-js`
- `client/src/firebase.js` → Firebase web SDK (client side only)
- No `render.yaml`, `Procfile`, or `Dockerfile` found — platform config
  is managed out-of-band in the Render dashboard

**Black-box bundle scan (IDA Pro analog):**
```bash
grep -oE 'https?://[a-zA-Z0-9./_-]+' client/dist/assets/index-71cf8e48.js
grep -o '"/api[^"]*"' client/dist/assets/index-71cf8e48.js
```
Finding: all absolute URLs belong to third-party SDKs; every backend call
is a relative `/api/...` path with no origin baked in.

#### Activity 5 — Refactoring

**Pattern 1: Replace inline ternary with named variables**
```js
// BEFORE: opaque
origin: process.env.NODE_ENV === 'production' ? [...] : "...",

// AFTER: named, with explanatory comment
const defaultOrigins = ...;     // backward-compatible fallback
const allowedOrigins = ...;     // env-driven or falls back to defaultOrigins
app.use(cors({ origin: allowedOrigins }));
```

**Pattern 2: Externalize implicit contract**  
`api/.env.example` converts the env var list from README prose
(which had already drifted from what `client/src/firebase.js` actually reads)
into a diff-able, copyable file.

**Run the demo:**
```bash
node maintenance/appendix/adaptive/change-management/repro-cors-portability.mjs
```

---

### CATEGORY 3 — Preventive Maintenance (PM-01)

**Change ID:** PM-01  
**Date:** 2026-08-17  
**Branch:** `preventive/booking-auth-input-hardening`  
**Commit:** `3c964bf` (+ `ff0b4ae` for secondary fix)  
**Trigger:** Proactive security audit — no reported incident

#### What the problems were (all latent, none exploited yet)

A proactive audit of `booking.route.js` and `booking.controller.js` found:

| # | Gap | Risk |
|---|-----|------|
| 1 | `POST /api/bookings` — no auth middleware | Unauthenticated caller can create bookings |
| 2 | `createBooking` reads `user_id` from `req.body` | Any authenticated user can book as any other user (impersonation) |
| 3 | `DELETE /api/bookings/:id` — no ownership check | Any authenticated user can delete any booking |
| 4 | `GET /api/bookings/user/:userId` — no ownership check | Any authenticated user can read any other user's bookings |
| 5 | `number_of_persons` — no range validation | `-1` (truthy, passes old `!field` check) stored in DB |
| 6 | `total_price` — no range validation | `-500` accepted and stored |
| 7 | `booking_date` — no future-date check | Past dates accepted and stored |

**Why preventive (not corrective)?** No incident was reported. The code was
found vulnerable during a scheduled audit. Preventive maintenance fixes
issues before they become failures.

#### Activity 1 — Program Comprehension

**Data flow mapped:**

```
Browser: POST /api/bookings { tour_id, booking_date, total_price, number_of_persons, user_id }
  ↓
booking.route.js: router.post("/", createBooking)
  ↓  (no auth middleware before PM-01)
booking.controller.js::createBooking()
  user_id = req.body.user_id   ← TRUST BOUNDARY VIOLATION
  new Booking({ user_id, ... }).save()
```

**Booking state machine reconstructed from schema enum:**

```
[pending] ──admin confirms──► [confirmed]
[pending] ──admin cancels ──► [cancelled]
[confirmed]──admin cancels──► [cancelled]
```

**Key structural insight:** `verifyUser` and `verifyAdmin` existed and were
used on every other sensitive route (tours, users) — they were simply not
wired into the booking router.

#### Activity 2 — Change Management

**Change Request:** `maintenance/appendix/preventive/change-management/CR-PM-01.md`

**New file: `api/utils/validateBooking.js`**
```js
export const validateBookingInput = (req, res, next) => {
  const { tour_id, booking_date, total_price, number_of_persons } = req.body;

  if (!tour_id)
    return next(errorHandler(400, "tour_id is required"));

  const persons = Number(number_of_persons);
  if (!Number.isInteger(persons) || persons < 1 || persons > 50)
    return next(errorHandler(400, "number_of_persons must be a whole number between 1 and 50"));

  const price = Number(total_price);
  if (!isFinite(price) || price < 0.01)
    return next(errorHandler(400, "total_price must be a positive number"));

  const date = new Date(booking_date);
  if (isNaN(date.getTime()))
    return next(errorHandler(400, "booking_date must be a valid date"));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (date < today)
    return next(errorHandler(400, "booking_date must not be in the past"));

  next();
};
```

**Updated `booking.route.js`:**
```js
// AFTER — every route now declares its auth requirement explicitly
router.post("/",           verifyUser,  validateBookingInput, createBooking);
router.get("/",            verifyAdmin, getAllBookings);
router.get("/revenue",     verifyAdmin, getRevenues);
router.get("/user/:userId",verifyUser,  getBookingsByUser);
router.put("/:id/status",  verifyAdmin, updateBookingStatus);
router.delete("/:id",      verifyUser,  deleteBooking);
```

**Updated `createBooking` (body → JWT):**
```js
// BEFORE
const { user_id, tour_id, ... } = req.body;

// AFTER
const { tour_id, ... } = req.body;
const user_id = req.user.id;   // from verified JWT — cannot be forged
```

**Updated `deleteBooking` (ownership check):**
```js
const booking = await Booking.findById(id);
if (!booking)
  return res.status(404).json({ success: false, message: "Booking not found" });
if (booking.user_id.toString() !== req.user.id && !req.user.admin)
  return res.status(403).json({ success: false, message: "Not authorised to delete this booking" });
await booking.deleteOne();
```

#### Activity 3 — Impact Analysis

| Route | Before PM-01 | After PM-01 |
|-------|-------------|------------|
| `POST /` | Open | `verifyUser` + `validateBookingInput` |
| `GET /` | Open | `verifyAdmin` only |
| `GET /revenue` | Open | `verifyAdmin` only |
| `GET /user/:userId` | Open | `verifyUser` + ownership check |
| `DELETE /:id` | Open | `verifyUser` + ownership check |

**Frontend impact: none.** The React app already sends cookies with every
request (`credentials: 'include'`). Body `user_id` was previously sent but
is now silently ignored (not a breaking change — the booking is still
created, just attributed to the JWT owner as intended).

**Database: unchanged.** No schema change, no migration.

**Security threats mitigated:**

| Threat | Before | After |
|--------|--------|-------|
| Booking impersonation | Exploitable | Mitigated (JWT enforced) |
| Unauthenticated booking creation | Exploitable | Mitigated (401) |
| Arbitrary booking deletion | Exploitable | Mitigated (403) |
| Reading another user's bookings | Exploitable | Mitigated (403) |
| Negative person count in DB | Possible | Rejected at API (400) |
| Past booking date | Accepted | Rejected at API (400) |

#### Activity 4 — Reverse Engineering

**Reconstructed API contract (post-fix — what it should have been):**

```
POST /api/bookings
  Auth:   access_token cookie required (JWT — verifyUser)
  Body:   { tour_id, booking_date, total_price, number_of_persons }
  Note:   user_id is derived from JWT; body user_id field is ignored
  Errors: 401 no cookie · 400 bad input ranges · 201 success

DELETE /api/bookings/:id
  Auth:   access_token cookie required
  Note:   caller must be the booking owner or an admin
  Errors: 401 no cookie · 403 not owner/admin · 404 not found · 200 success
```

**Trust hierarchy recovered:**
```
Unauthenticated   → browse tours/blogs only
Authenticated user → manage own bookings and reviews
Admin             → manage all users, bookings, tours, blogs
```

This hierarchy was consistently implemented everywhere except the booking
router — PM-01 closes that gap.

#### Activity 5 — Refactoring

| Pattern | What was done |
|---------|--------------|
| **Extract Middleware** | Input validation moved from controller into `validateBooking.js` — controller now handles business logic only |
| **Replace Body Trust with Token Trust** | `user_id = req.user.id` replaces `user_id = req.body.user_id` — security contract made explicit in code |
| **Guard Clause** | Early-return ownership check in `deleteBooking` keeps the happy path unindented |
| **Middleware Chain as Policy Document** | `booking.route.js` now reads as a complete access-control matrix — security posture visible at a glance |

**Cyclomatic complexity of `createBooking`:** 3 → 2 (validation extracted).

**Run the demo:**
```bash
node maintenance/appendix/preventive/repro-booking-auth.mjs
```

Expected output highlights:
- Test 1: `BEFORE booked_as=user-bob-999` → `AFTER booked_as=user-alice-001`
- Test 2: `BEFORE status=201` → `AFTER status=401 Not authenticated!`
- Test 3: `BEFORE status=201` → `AFTER status=400 number_of_persons...`

---

### CATEGORY 4 — Perfective Maintenance (PFM-01)

**Change ID:** PFM-01  
**Date:** 2026-08-17  
**Branch:** `perfective/tour-pagination`  
**Commit:** `bfccacb`  
**Trigger:** Proactive performance/scalability improvement — no bug

#### What the problem was

`getAllTours` and `getAllBookings` executed unbounded `Model.find()` with no
`.limit()`:

```js
// BEFORE — tour.controller.js::getAllTours
const tours = await Tour.find().sort({ created_at: -1 });
res.status(200).json({ success: true, data: tours });
// ↑ entire collection loaded into Node heap on every browse-page request
```

**Consequence at scale:**

| Tours in DB | Response size | Approx serialization time |
|-------------|--------------|--------------------------|
| 100 | ~200 KB | < 10 ms (fine) |
| 1,000 | ~2 MB | ~50 ms (slow) |
| 10,000 | ~20 MB | ~500 ms (unacceptable) |
| 100,000 | ~200 MB | memory pressure / OOM risk |

**Why perfective (not corrective)?** The app is correct — it returns all
tours as intended. This change makes it scale. Behaviour is improved, not
fixed.

**Contrast with existing patterns:** `getFeaturedTours` already used
`.limit(6)`; `getRecentReviewsByTour` used `.limit(5)`. The pattern existed
in the codebase — it was simply not applied uniformly to the general listing
endpoints.

#### Activity 1 — Program Comprehension

**Data flow analysed:**

```
Browser: GET /api/tours
  ↓
tour.route.js: router.get("/", getAllTours)
  ↓
tour.controller.js::getAllTours()
  Tour.find().sort({ created_at: -1 })
  // ↑ no .skip(), no .limit() — full collection scan every time
  res.json({ success: true, data: tours })
```

**Frontend callers identified (grep):**

| File | Access pattern |
|------|---------------|
| `Tours.jsx` | `response.data.data` (the array) |
| `AdminTours.jsx` | `response.data.data` |

The `data` key in the response envelope is preserved after the change —
these callers are unaffected.

**Recovery finding:** `tour.model.js` defines a full MongoDB text index:
```js
tourSchema.index({ title: 'text', description: 'text', location: 'text' });
```
But `searchTours` uses regex, not `$text` — the index exists and is unused.
Logged as a future PFM candidate.

#### Activity 2 — Change Management

**Change Request:** `maintenance/appendix/perfective/change-management/CR-PFM-01.md`

**New file: `api/utils/paginate.js`**
```js
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePagination = (req) => {
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

export const paginationEnvelope = ({ data, total, page, limit }) => ({
  success: true,
  count: data.length,
  page,
  totalPages: Math.ceil(total / limit),
  total,
  data,
});
```

**Updated `getAllTours`:**
```js
// AFTER — tour.controller.js
const { page, limit, skip } = parsePagination(req);
const [tours, total] = await Promise.all([
  Tour.find().sort({ created_at: -1 }).skip(skip).limit(limit),
  Tour.countDocuments(),   // runs in parallel — no extra latency
]);
res.status(200).json(paginationEnvelope({ data: tours, total, page, limit }));
```

**API contract change (additive — backward compatible):**
```json
// BEFORE
{ "success": true, "data": [ ...all tours... ] }

// AFTER
{
  "success": true,
  "count": 10,
  "page": 1,
  "totalPages": 4,
  "total": 38,
  "data": [ ...10 tours... ]
}
```

Existing consumers that read `response.data.data` (the array) are unaffected —
the `data` key is still present at the same path.

#### Activity 3 — Impact Analysis

| Scope | Impact |
|-------|--------|
| Frontend callers | Zero breaking changes — `data` key preserved |
| Database queries | +1 `countDocuments()` per request (fast: uses collection metadata when no filter) |
| Node heap usage | Bounded at `MAX_LIMIT = 100` docs — no longer grows with collection size |
| Network payload | ~20 KB per page vs. unbounded before |
| Admin workflow | Admin sees 10 bookings per page — must use `?page=2` for more |

**Risk:** Admin UI may need a pagination widget to show bookings beyond page 1.
Not a breaking change (data is still returned), but UX-incomplete until the
frontend adds next/prev controls.

#### Activity 4 — Reverse Engineering

**Reconstructed original developer assumption:**

By comparing `getAllTours` (no limit) vs. `getFeaturedTours` (`.limit(6)`) vs.
`getRecentReviewsByTour` (`.limit(5)`), the implicit design intent is
recoverable:

- Fixed-size endpoints: developer knew they'd always return a small set → used `.limit()`
- `getAllTours`: developer assumed the collection stays small → no `.limit()`

This assumption is documented nowhere. Reverse engineering recovers it from
the presence/absence of the `.limit()` call.

**Reconstructed `getAllTours` API contract (pre-PFM-01):**
```
GET /api/tours
  Auth: none
  Query: (none accepted)
  Response: { success: true, data: Tour[] }  ← ALL documents, unbounded
  Implicit assumption: collection is small and stays small
```

#### Activity 5 — Refactoring

| Pattern | What was done |
|---------|--------------|
| **Extract Function** | Pagination logic in `paginate.js` — any future endpoint adopts it in 3 lines |
| **Parallel Queries** | `Promise.all([find, count])` — data + total count run concurrently, same wall time as one query |
| **Consistent Return Shape** | `paginationEnvelope()` guarantees the same JSON structure everywhere |
| **Guard against infinite payloads** | `MAX_LIMIT = 100` cap — `?limit=999999` returns at most 100 docs |

**Metric:** Before — unbounded heap load per request. After — O(1) heap
independent of collection size (bounded at `MAX_LIMIT`).

**Run the demo:**
```bash
node maintenance/appendix/perfective/repro-pagination.mjs
```

---

## 4. Tools Used

| Tool (course-specified) | Status in this project | What was actually used | Evidence |
|------------------------|----------------------|----------------------|----------|
| **SonarQube** | Not reachable (Docker daemon unavailable) | ESLint + manual `$regex` grep (same pattern as SonarQube rule S5852) | `maintenance/appendix/corrective/eslint/` |
| **Doxygen** | Binary not on PATH | JSDoc 4.0.5 — correct tool for a JS codebase; Doxygen itself recommends JSDoc for JS | `maintenance/appendix/corrective/jsdoc/html/index.html` |
| **IDA Pro** | Not applicable to interpreted JS | Grepped minified Vite production bundle — same concept (black-box structure recovery) | `maintenance/appendix/adaptive/reverse-engineering/minified-bundle-blackbox-scan.md` |
| **IntelliJ IDEA** | GUI-only, not scriptable headlessly | `madge` for dependency graphs; menu paths documented for local reproduction | `maintenance/appendix/*/dependency-graph/` |
| **AST Explorer** | Browser-only | `espree` (same parser) invoked locally via Node script | `maintenance/appendix/corrective/ast/` |
| **SnakeViz** | ✅ Executed for real | `cProfile` + `snakeviz --server` — profile served and verified via `curl` | `maintenance/appendix/corrective/profiling/` |
| **madge** | ✅ Executed for real | JS dependency graph — `api/` and `client/src/` | `maintenance/appendix/*/dependency-graph/` |
| **ESLint** | ✅ Executed for real | Applied to `api/` (no lint config existed) and specific changed `client/` files | `maintenance/appendix/corrective/eslint/` |

Full tool justifications: `maintenance/appendix/tools/TOOL_SUBSTITUTION_NOTES.md`

---

## 5. Git History Summary

```
75e084e  docs(maintenance): HOW_TO_DEMO.md
ff0b4ae  qa: demo scripts, auth gap fix, repro outputs
50a6c31  docs(maintenance): extend report with PM-01 and PFM-01
bfccacb  perf(api): PFM-01 — paginate getAllTours and getAllBookings
3c964bf  fix(api):  PM-01 — booking auth hardening + input validation
0a1a026  feat(api): AM-01 — env-driven CORS allow-list + Node engines pin
68ea47c  chore:     track maintenance JSON artifacts
e841e93  fix(api):  CM-01 — sanitize user input before MongoDB $regex
```

| Branch | Type | Merged to main |
|--------|------|---------------|
| `corrective/tour-blog-search-regex-sanitization` | CM-01 | ✅ |
| `adaptive/env-driven-cors-and-runtime-pinning` | AM-01 | ✅ |
| `preventive/booking-auth-input-hardening` | PM-01 | ✅ |
| `perfective/tour-pagination` | PFM-01 | ✅ |

---

## 6. Key Findings Summary (use these as report conclusions)

1. **Pattern inconsistency is the most common root cause.** Both CM-01
   (regex escaping applied in some places but not all) and PM-01 (auth
   middleware applied to tours/users but not bookings) were caused by a
   correct pattern being used inconsistently. Systematic tool-based search
   (grep, madge, ESLint) is necessary because manual reading misses all but
   the first occurrence.

2. **Corrective and preventive maintenance are distinguished by timing, not
   technique.** CM-01 fixed an active, exploitable bug. PM-01 fixed the same
   category of gap (missing auth, missing validation) before any incident.
   The code changes look similar; the difference is what triggered the work.

3. **Impact analysis must be evidence-based, not assumed.** In every case,
   the frontend impact ("no changes needed") was confirmed by grep and madge
   — not assumed from reading the backend code. This is the only way to
   catch cases where the assumption is wrong.

4. **Reverse engineering surfaces implicit design assumptions.** The
   `getAllTours` endpoint had no `.limit()` not because the developer forgot —
   it's because they assumed the collection would stay small. This assumption
   was recoverable only by reverse engineering (comparing with endpoints that
   did use `.limit()`). Without RE, a "fix" might solve the symptom but miss
   the root cause.

5. **Refactoring multiplies future maintenance speed.** `escapeRegex.js`,
   `validateBooking.js`, and `paginate.js` are each single-responsibility
   utilities. Any future endpoint that needs regex safety, booking validation,
   or pagination adds three lines instead of rewriting the logic from scratch.

6. **Adaptive maintenance is the hardest to argue for.** AM-01 fixed
   nothing that was broken. Justifying it required reconstructing the
   deployment topology by reverse engineering, quantifying the blast radius
   (50 call sites), and proving backward compatibility with a live HTTP test.
   This is why adaptive maintenance is often deferred until breakage occurs.

---

## 7. How to Run All Demos

```bash
# Prerequisites (one-time)
cd ghuroo/
npm install express cors --no-save

# CM-01 — ReDoS crash demonstration
node maintenance/appendix/corrective/repro-regex-bug.mjs

# CM-01 — ReDoS timing profile (requires Python)
python maintenance/appendix/corrective/profiling/redos_impact_profile.py

# AM-01 — CORS portability demonstration
node maintenance/appendix/adaptive/change-management/repro-cors-portability.mjs

# PM-01 — Booking auth hardening demonstration
node maintenance/appendix/preventive/repro-booking-auth.mjs

# PFM-01 — Pagination utility demonstration
node maintenance/appendix/perfective/repro-pagination.mjs
```

Quick-reference: `maintenance/HOW_TO_DEMO.md`

---

## 8. Files to Open for the Viva

| Purpose | File |
|---------|------|
| Full technical report | `maintenance/MAINTENANCE_REPORT.md` |
| Raw session diary (commands + output) | `maintenance/MAINTENANCE_LOG.md` |
| Demo run instructions | `maintenance/HOW_TO_DEMO.md` |
| This context document | `maintenance/REPORT_CONTEXT.md` |
| CM-01 change request | `maintenance/appendix/corrective/change-management/CR-2026-07-10-01.md` |
| AM-01 change request | `maintenance/appendix/adaptive/change-management/CR-2026-07-10-02.md` |
| PM-01 change request | `maintenance/appendix/preventive/change-management/CR-PM-01.md` |
| PFM-01 change request | `maintenance/appendix/perfective/change-management/CR-PFM-01.md` |
| ReDoS profiling data | `maintenance/appendix/corrective/profiling/redos_impact_summary.txt` |
| JSDoc HTML (open in browser) | `maintenance/appendix/corrective/jsdoc/html/index.html` |
| Tool substitution justifications | `maintenance/appendix/tools/TOOL_SUBSTITUTION_NOTES.md` |
