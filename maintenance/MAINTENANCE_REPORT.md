# Ghuroo — Software Maintenance Report

**Project:** Ghuroo, a MERN (MongoDB, Express, React, Node.js) travel & tourism
platform with CRUD-based tour, booking, blog, and review management, plus
separate user/admin surfaces (`d:\Ghuroo`).
**Maintenance types performed:** Corrective, Adaptive, Preventive, Perfective.
**Session dates:** 2026-07-10 (CM-01, AM-01) · 2026-08-17 (PM-01, PFM-01).
**Companion files:** [`MAINTENANCE_LOG.md`](MAINTENANCE_LOG.md) (raw
chronological command/output diary) and the `appendix/` folder this report
indexes at the end.

Each maintenance type below works through the same five activities, in order,
as required: **Program Comprehension → Change Management → Impact Analysis →
Reverse Engineering → Refactoring**. Both cycles were carried out as real
changes on dedicated git branches (not hypothetical write-ups) so that every
claim in this report is backed by a runnable script, a tool report, or a git
diff — see the Appendix for the full evidence index.

| Branch | Base | Commits | Contains |
|---|---|---|---|
| `corrective/tour-blog-search-regex-sanitization` | `main` | `e841e93`, `68ea47c` | CM-01 fix + evidence |
| `adaptive/env-driven-cors-and-runtime-pinning` | corrective branch | `0a1a026` | AM-01 fix + evidence |
| `preventive/booking-auth-input-hardening` | `main` | `3c964bf` | PM-01 fix + evidence |
| `perfective/tour-pagination` | preventive branch | `bfccacb` | PFM-01 fix + evidence |

---

# Part A — Corrective Maintenance (CM-01)

**Defect:** unescaped user input passed straight into MongoDB `$regex`
queries in the tour and blog search endpoints, causing (a) request crashes on
certain inputs and (b) a Regular-Expression-Denial-of-Service (ReDoS,
CWE-1333) vector — a genuine, currently-live defect in
`api/controllers/tour.controller.js` (`searchTours`, `getToursByLocation`)
and `api/controllers/blog.controller.js` (`searchBlogs`), all three of which
are public, unauthenticated routes.

## A.1 Program Comprehension

Comprehension was built top-down, then verified bottom-up with tooling —
not assumed from a single read-through.

**1. History-guided triage.** `git log` shows the search feature is recent
(`050173c implemented the search functionality in the landing page`,
preceded by `e2bd36e UI in the hero section changed`) — recently-added,
UI-driven, user-input-accepting code is exactly where a maintenance sweep
should look first, so it was the starting point rather than a random file.

**2. Structural comprehension via dependency graph.** `madge` (a JS/TS
dependency-graph tool; see `appendix/tools/TOOL_SUBSTITUTION_NOTES.md` for
why it stands in for parts of IntelliJ's diagramming here) was run against
`api/`:

```
npx madge --extensions js api --json > appendix/corrective/dependency-graph/api-dependency-graph.json
npx madge --extensions js api --circular   # -> "No circular dependency found!"
```

Querying the graph confirms a single, simple import chain:
`api/index.js → routes/tour.route.js → controllers/tour.controller.js →
models/tour.model.js` (and the equivalent for blog), with **no other backend
module importing either controller** — i.e. the defect's blast radius on the
server is structurally contained before any line of the fix was written.

**3. Data-flow comprehension via AST (AST Explorer equivalent).** The
pre-fix `searchTours` function was parsed locally with `espree` (the same
parser ESLint/astexplorer.net use) instead of pasting into the browser tool,
via `appendix/corrective/ast/generate-ast.mjs`. The resulting annotated
depth-first walk (`appendix/corrective/ast/searchTours-original.ast-walk.txt`)
mechanically flags every node where `term` (the tainted source —
`req.params.term`, fully attacker-controlled) and every `$regex` property
(the sink) appear:

```
Identifier  <-- tainted source (raw req.params.term)
...
Property  <-- SINK: value handed to MongoDB $regex without sanitization
  Identifier
  Identifier  <-- tainted source (raw req.params.term)
```

This appears **three times** inside `searchTours` alone (title, description,
location), which is what motivated checking for the same shape elsewhere
rather than patching only the first occurrence found.

**4. Systematic pattern search (grep-as-poor-man's-SonarQube).** Since a real
SonarQube instance wasn't reachable in this session (see
`appendix/tools/TOOL_SUBSTITUTION_NOTES.md`), the equivalent of its
`javascript:S5852` rule ("Regular expressions should not be vulnerable to
Denial of Service attacks") was run manually:

```
grep -rn '\$regex' api --include=*.js
```

This is what actually found the **full scope** of the defect — not just
`searchTours`, but a second vulnerable site in the same file
(`getToursByLocation`, line 260) and a third in an entirely different
controller (`blog.controller.js:184-185`, `searchBlogs`) — four `$regex`
sinks across two files, none of which would have been found by only reading
the one function the bug report would naturally point at.

**5. Static analysis for broader code health.** `api/` had no ESLint config
at all prior to this session (only `client/` did). A minimal
`eslint:recommended` config was added *inside the maintenance folder*
(`appendix/corrective/eslint/api.eslintrc.json`, not touching the project's
own lint setup) and run:

```
client/node_modules/.bin/eslint --no-eslintrc -c appendix/corrective/eslint/api.eslintrc.json api
```

Real findings (`appendix/corrective/eslint/api-eslint-report.txt`):

```
api/controllers/auth.controller.js
   78:7  error  Duplicate key 'role'  no-dupe-keys
  121:7  error  Duplicate key 'role'  no-dupe-keys
api/controllers/booking.controller.js
  150:11  warning  'previousBooking' is assigned a value but never used
api/controllers/tour.controller.js
  62:11  warning  'admin' is assigned a value but never used
api/index.js
  17:19  warning  'join' is defined but never used
  78:25  warning  'next' is defined but never used
```

None of these are the ReDoS/crash defect and none were fixed in this cycle
(see "Backlog" in the Appendix) — they're recorded here because comprehension
work surfaced them as a side effect, and a maintenance report that only
mentions the one bug it fixes understates what was actually read.

**6. Dead-code discovery.** While tracing the search UI's actual entry point,
`client/src/pages/Home.jsx` was found to `import Hero from
"../components/Hero"` — but `<Hero />` is never rendered anywhere in the
file. `Hero.jsx` has its **own**, separate, non-functional search bar (no
`onSubmit` handler at all). Confirmed with a real ESLint run against both
files:

```
client\src\components\Hero.jsx    1:8  error  'React' is defined but never used
client\src\pages\Home.jsx         3:8  error  'Hero' is defined but never used
```

This mattered practically: it stopped effort from being spent tracing or
testing `Hero.jsx`'s search box (which does nothing) instead of `Home.jsx`'s
real, wired-up search `<form onSubmit={handleSearch}>` — the actual code
path that reaches `searchTours`.

## A.2 Change Management

**Change Request:** [`appendix/corrective/change-management/CR-2026-07-10-01.md`](appendix/corrective/change-management/CR-2026-07-10-01.md)
(severity High, priority P2 — public unauthenticated endpoint, no active
exploitation observed).

**Branching.** A dedicated branch was created off `main` before any edit:

```
git checkout -b corrective/tour-blog-search-regex-sanitization
```

**Change made.** New file `api/utils/escapeRegex.js`:

```js
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

Applied at all four sink sites identified in A.1 (excerpt, full diff at
`appendix/corrective/change-management/code-fix.diff`):

```diff
- { title: { $regex: term, $options: "i" } },
- { description: { $regex: term, $options: "i" } },
- { location: { $regex: term, $options: "i" } },
+ const safeTerm = escapeRegex(term);
+ { title: { $regex: safeTerm, $options: "i" } },
+ { description: { $regex: safeTerm, $options: "i" } },
+ { location: { $regex: safeTerm, $options: "i" } },
```

**Verification gates before considering the change done:**
1. `node --check` on every modified file (syntax).
2. Behavioural repro script, before/after (`appendix/corrective/repro-regex-bug.mjs`).
3. Quantified performance repro, before/after (`appendix/corrective/profiling/`).
4. Re-run of the ESLint sweep from A.1 — confirms **no new** warnings
   introduced by the fix itself.

**Commits** (traceable to the CR ID in the message body):

```
e841e93 fix(api): sanitize user input before MongoDB $regex in tour/blog search
68ea47c chore: track maintenance/ JSON artifacts despite blanket *.json ignore
```

**Rollback plan:** single `git revert` of `e841e93` — the change is additive
(one new file, four call-site edits), no data migration involved.

## A.3 Impact Analysis

**Server-side blast radius (confirmed, not assumed):** the `madge`
reverse-dependency query in A.1 shows only `tour.route.js` /
`blog.route.js` import the two changed controllers — no service layer, no
other controller, reuses these functions.

**Client-side blast radius (grep-verified call sites):**

| Endpoint | Client callers |
|---|---|
| `GET /api/tours/search/:term` | `client/src/pages/Home.jsx:54`, `client/src/pages/Tours.jsx:58` |
| `GET /api/tours/location/:location` | `client/src/pages/DestinationDetails.jsx:43` |
| `GET /api/blogs/search/:term` | **none** — route is publicly reachable but has no UI caller today |

Response shape is unchanged for all three (`{ success, data }`), so this is a
zero-regression-risk change for legitimate callers — verified by the repro
script showing identical output for realistic search terms (`"Cox's Bazar"`
matches the same either way; only inputs containing regex metacharacters
change behaviour, and they change from *broken* to *correct*).

**Security/availability impact — quantified, not asserted.** Python +
`cProfile` + SnakeViz were used to measure the actual cost of the ReDoS
shape (`(a+)+$`) that an attacker could submit as `term`
(`appendix/corrective/profiling/redos_impact_profile.py`,
`redos_impact_summary.txt`):

| Crafted subject length | Before fix (raw `$regex`) | After fix (`escapeRegex` applied) |
|---:|---:|---:|
| 10 | 0.103 ms | 0.071 ms |
| 16 | 2.041 ms | 0.001 ms |
| 20 | 30.505 ms | 0.001 ms |
| 24 | 531.290 ms | 0.001 ms |
| 26 | **2089.194 ms** | 0.001 ms |

The blow-up is the textbook exponential ReDoS curve (roughly doubling every
+2 characters); a term only slightly longer than 26 characters would tie up
a request for minutes. `snakeviz --server` was started against the resulting
`.prof` file and queried with `curl` to confirm it renders the profile (HTTP
200; saved at `appendix/corrective/profiling/snakeviz_rendered_page.html`)
before being shut down — see `appendix/tools/TOOL_SUBSTITUTION_NOTES.md` for
why Python/SnakeViz is the correct measurement instrument here even though
Ghuroo itself has no Python component.

**Data/auth impact:** none — no schema change, routes remain intentionally
public (they are search boxes, not privileged endpoints).

## A.4 Reverse Engineering

**Taint-flow recovery from AST (AST Explorer equivalent).** Already detailed
in A.1 — recovering "where does untrusted input reach a dangerous sink"
purely from the parsed structure of the function, without executing it, is
itself a reverse-engineering technique (structural analysis of code whose
runtime behaviour under adversarial input was not otherwise documented
anywhere).

**Reverse-engineered API contract.** No OpenAPI/Swagger spec exists anywhere
in the repo for these endpoints. The following was reconstructed purely from
controller code + client call sites (i.e. as if writing the missing API
documentation after the fact):

| Method & path | Auth | Params | Success response | Notes |
|---|---|---|---|---|
| `GET /api/tours/search/:term` | none | `term` (path, required) | `{ success: true, data: Tour[] }`, populated `created_by.full_name`; if `term` parses as a number, also OR-matches `price`/`duration_days` | Pre-fix: 500 on regex-invalid `term` |
| `GET /api/tours/location/:location` | none | `location` (path, required) | `{ success: true, data: Tour[] }`, exact case-insensitive match (`^...$` anchors) | Pre-fix: same regex-injection shape |
| `GET /api/blogs/search/:term` | none | `term` (path, required) | `{ success: true, data: Blog[] }`, populated `user_id.full_name`/`profilePicture` | No current UI caller (dead route from the frontend's perspective, still publicly reachable) |

**Structural documentation (Doxygen substitute).** [JSDoc](https://jsdoc.app/)
4.0.5 was run against `api/controllers`, `api/models`, `api/routes`,
`api/utils` (Doxygen itself wasn't available in this environment — see
Appendix tool notes for why JSDoc is the correct like-for-like substitute for
a pure-JS codebase, not just a fallback):

```
npx jsdoc -r api/controllers api/models api/routes api/utils -d appendix/corrective/jsdoc/html
```

Output: `appendix/corrective/jsdoc/html/index.html`.

**IntelliJ IDEA (manual step, for local reproduction).** To see the same
route→controller→model chain used in A.1 as a live diagram: open the project
in IntelliJ, right-click `api/` in the Project pane → **Diagrams → Show
Diagram…** → select "Show Dependencies" — this renders the same import graph
`madge` produced above, generated from IntelliJ's own indexer instead of a
CLI tool.

## A.5 Refactoring

The fix itself was written as a small refactor rather than four inline
patches: **Extract Function** — `escapeRegex` was pulled out into
`api/utils/escapeRegex.js` (matching the existing `api/utils/error.js`
one-function-per-file convention already used in this codebase) instead of
inlining `text.replace(/[...]/g, "\\$&")` four times across two files. This
removes duplication *and* gives the sanitization step a name, so a future
reader immediately knows why a `$regex` site is safe without re-deriving the
regex-escaping logic each time.

**Deliberately not refactored in this cycle** (scoped out to keep the change
reviewable and single-purpose — see Appendix "Backlog"):
- The duplicate `role` keys in `auth.controller.js` (harmless but redundant).
- Unused `previousBooking` / `admin` variables flagged by ESLint.
- The orphaned `Hero.jsx` component and its dead import in `Home.jsx`.

These are logged, not fixed, because none of them are part of the defect
being corrected — bundling unrelated cleanup into a security fix makes the
fix harder to review and revert independently, which is the opposite of what
good change management (Part A.2) is for.

---

# Part B — Adaptive Maintenance (AM-01)

**Trigger:** not a defect — Ghuroo works correctly today, deployed to exactly
one Render URL. The CORS configuration in `api/index.js` hardcodes that one
origin per `NODE_ENV`, which is a classic adaptive-maintenance situation
(IEEE 14764: modifying a system to keep it usable as its *operating
environment* changes, as distinct from fixing a defect or adding a feature):
the day a custom domain, a staging subdomain, or a separately-hosted preview
frontend is introduced, every cross-origin request from that new environment
silently fails, with no way to fix it short of a code change and redeploy.

## B.1 Program Comprehension

**No architecture documentation exists** for how Ghuroo is actually deployed
— the README only lists env vars and local dev commands. This had to be
reconstructed from configuration and entrypoint code before any change could
be scoped correctly (full evidence trail in
[`appendix/adaptive/reverse-engineering/deployment-topology.md`](appendix/adaptive/reverse-engineering/deployment-topology.md),
summarized in B.4).

Key comprehension findings that shaped the fix:

1. **`api/index.js` is a single Express process** serving both the built
   React SPA (`express.static` + catch-all `sendFile`) and every `/api/*`
   route — there is exactly **one** place in the whole backend where an
   "environment" (origin, port) assumption is hardcoded: the CORS middleware
   registration. This is good news for an adaptive fix — it means the change
   is a single-point edit, not a shotgun-surgery refactor across many files.
2. **The client never hardcodes a backend origin.** Every network call in
   `client/src` is a same-origin relative `fetch("/api/...")` — confirmed
   both by reading source and, independently, by black-box-scanning the
   *compiled* production bundle (B.4) so this isn't just an assumption from
   reading code that might not match what actually shipped.
3. **`firebase-admin` is a declared dependency that is never imported
   anywhere in `api/`** (`grep -ri firebase api/` → no hits). It doesn't
   affect the CORS fix, but it's an environment-relevant finding (unused
   backend dependency inflating install size/attack surface) worth recording
   while already auditing environment coupling.
4. **`client/src/firebase.js` hardcodes its Firebase project config in
   source**, rather than reading the six `VITE_FIREBASE_*` variables the
   README documents as required `.env` entries. Not a security issue
   (Firebase web config is meant to be public), but a genuine
   documentation/implementation mismatch and a natural *next* adaptive-
   maintenance candidate (making the Firebase project itself swappable per
   environment) — logged as backlog, not fixed this cycle (see Appendix).
5. **Sizing the blast radius the CORS gate protects:** `madge` against
   `client/src` (42 modules) plus a grep for `fetch(...)` call sites touching
   `/api` gives a concrete number instead of a vague "the frontend depends on
   the backend": **27 files, 50 call sites** all funnel through this one
   CORS check.
6. **No `engines` field existed** in `package.json`, so Render's Node-version
   auto-detection is free to drift over time; checking installed dependency
   manifests directly (`node_modules/*/package.json`) showed `firebase-admin`
   already declares `"node": ">=18"` — the strictest floor among direct
   dependencies, and the value used for the fix (B.5), not an arbitrary guess.

## B.2 Change Management

**Change Request:** [`appendix/adaptive/change-management/CR-2026-07-10-02.md`](appendix/adaptive/change-management/CR-2026-07-10-02.md)
(severity Medium, priority P3 — proactive, not urgent: nothing is broken in
the current single-origin deployment).

**Branching.** This cycle was carried out as a second, sequential maintenance
pass in the same session, so the branch was created **on top of** the
corrective branch (rather than off `main` again) so both cycles' artifacts
live together in `maintenance/` without duplicating the shared log/tooling
files:

```
git checkout -b adaptive/env-driven-cors-and-runtime-pinning   # from corrective/...
```

**Change made** (`api/index.js`, excerpt — full diff will be committed
alongside this report):

```diff
- // Fixed CORS configuration
- app.use(
-   cors({
-     origin: process.env.NODE_ENV === 'production'
-       ? ["https://ghuroo.onrender.com"]
-       : "http://localhost:5173",
-     credentials: true,
-   })
- );
+ const defaultOrigins =
+   process.env.NODE_ENV === "production"
+     ? ["https://ghuroo.onrender.com"]
+     : ["http://localhost:5173"];
+ const allowedOrigins = process.env.ALLOWED_ORIGINS
+   ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
+   : defaultOrigins;
+ app.use(cors({ origin: allowedOrigins, credentials: true }));
```

Plus: `"engines": { "node": ">=18" }` added to `package.json`, and a new
`api/.env.example` documenting the full environment contract including the
new `ALLOWED_ORIGINS` variable.

**Verification gates:**
1. `node --check api/index.js` (syntax).
2. Live functional repro — real Express + `cors` servers, real HTTP requests
   with different `Origin` headers, not a unit-test mock (B.3 has the
   results table).

**Rollback plan:** single revert of the branch's commit; config-only change,
no data migration.

## B.3 Impact Analysis

**Regression check (must-pass before this counts as safe):** with
`ALLOWED_ORIGINS` unset, does the new code behave *identically* to the old
hardcoded code? Verified with a live repro
(`appendix/adaptive/change-management/repro-cors-portability.mjs`) — two real
Express servers (old config, new config with the env var unset) were hit with
real HTTP requests carrying different `Origin` headers:

```
=== OLD config: hardcoded single origin ===
  Origin: https://ghuroo.onrender.com  -> access-control-allow-origin: https://ghuroo.onrender.com
  Origin: https://ghuroo.app           -> access-control-allow-origin: (absent = blocked)

=== NEW config: ALLOWED_ORIGINS unset (must match old behaviour) ===
  Origin: https://ghuroo.onrender.com  -> access-control-allow-origin: https://ghuroo.onrender.com
  Origin: https://ghuroo.app           -> access-control-allow-origin: (absent = blocked)

=== NEW config: ALLOWED_ORIGINS=https://ghuroo.onrender.com,https://ghuroo.app ===
  Origin: https://ghuroo.onrender.com  -> access-control-allow-origin: https://ghuroo.onrender.com
  Origin: https://ghuroo.app           -> access-control-allow-origin: https://ghuroo.app
```

Rows 1–2 are byte-for-byte identical between old and new code (zero
regression for the existing deployment); row 3 proves the new capability
actually works once configured.

**Frontend impact: none required**, and this was *confirmed* rather than
assumed — see B.4's black-box bundle scan. All 27 files / 50 call sites from
B.1 keep working unmodified; they were never origin-aware in the first
place.

**Backend impact:** isolated to one middleware registration in
`api/index.js`; `madge` confirms `api/index.js` is the entrypoint (nothing
imports it), so there is no upstream caller whose behaviour could be
indirectly affected.

**Operational impact:** zero-touch until a second origin is actually needed
— at that point, it's a Render dashboard env var change (`ALLOWED_ORIGINS`),
not a code change or redeploy-with-new-source. The `engines` pin only takes
effect on Render's *next* build/deploy Node-version resolution; it does not
change the currently-running Node version.

## B.4 Reverse Engineering

**Deployment topology**, reconstructed with no architecture doc to start
from (full evidence table + Mermaid diagram in
[`appendix/adaptive/reverse-engineering/deployment-topology.md`](appendix/adaptive/reverse-engineering/deployment-topology.md)):
a single Render web service running `node api/index.js` serves the built
React SPA and all `/api/*` routes from one process, backed by external
MongoDB Atlas and Supabase Storage, with Firebase used client-side only for
Google OAuth (the app's own JWT-in-cookie session is issued server-side after
exchanging the Firebase identity — `api/utils/jwt.js`). No `render.yaml`,
`Procfile`, `vercel.json`, or `Dockerfile` exists in-repo, meaning the
platform-level build/start commands are configured out-of-band in Render's
dashboard rather than version-controlled — itself a relevant environment-
portability observation for this maintenance case.

**Black-box scan of the compiled bundle (IDA Pro analog).** IDA Pro
disassembles compiled binaries with no source available — the closest
equivalent artifact in this repo is the minified Vite production bundle,
`client/dist/assets/index-71cf8e48.js` (479 KB, no source map). It was
grepped **without consulting `client/src`** to answer one structural
question, exactly the way one would interrogate a stripped binary:

```
grep -oE 'https?://[a-zA-Z0-9./_-]+' index-71cf8e48.js | sort -u
grep -o '"/api[^"]*"' index-71cf8e48.js | sort -u
```

Result: every absolute URL recovered belongs to a third-party SDK (Firebase,
Google reCAPTCHA, Unsplash image CDN); every backend call recovered is a bare
relative path (`"/api/auth/google"`, `"/api/auth/signin"`, etc.) with no
origin baked in. This *closes* the question B.1 opened rather than leaving it
assumed — it's the direct justification for why AM-01's scope is correctly
limited to the server side. (Full writeup, including the caveat that this
`dist/` build is untracked/stale per `.gitignore`'s bare `dist` rule and
predates the search feature, is in the linked file.)

**IntelliJ IDEA (manual step).** To reproduce the client fan-out count from
B.1 visually: open `client/` in IntelliJ, right-click `src/` → **Diagrams →
Show Diagram…**, or use **Analyze → Show Dependencies…** scoped to
`pages/` + `components/` to see the same 27-file fan-in that this report
derived from `madge` + grep.

## B.5 Refactoring

Two small refactors were bundled with the behavioural change, both to the
*seam already being touched* (not scope-crept elsewhere):

1. **Replace inline ternary with named, documented variables.** The original
   `origin: process.env.NODE_ENV === 'production' ? [...] : "..."` was a
   nested conditional directly inside the `cors()` call. It's now two named
   steps — `defaultOrigins` then `allowedOrigins` — each with a comment
   explaining *why* (env-driven for portability, falls back to old literal
   for compatibility). This is a readability refactor riding along with the
   feature, not a separate cleanup pass.
2. **Externalize implicit environment documentation.** Previously the only
   record of what environment variables the API needs was README prose
   (already found, in B.1, to have drifted from what the client code
   actually reads). `api/.env.example` turns "what env vars exist" from tribal
   knowledge/README prose into a file that can be diffed, copied, and kept in
   sync going forward — a documentation refactor in the same spirit as
   Extract Function: give the implicit concept ("the environment contract") an
   explicit, named home.

**Deliberately not refactored in this cycle:** the hardcoded Firebase client
config (B.1 finding 4) and the unused `firebase-admin` dependency (B.1
finding 3) — both are real environment-coupling issues, but neither is part
of *this* change's seam (CORS/runtime portability), and bundling them in
would mix an unrelated Firebase-project-portability concern into a CORS fix.
Logged to backlog below instead.

---

# Appendix

## Tool usage index

| Course tool | Applicability to this MERN/JS codebase | What was actually run | Evidence |
|---|---|---|---|
| **SonarQube** | Applicable in principle (JS/TS analyzer exists); no reachable server in this sandboxed session (Docker daemon unreachable — see log) | `sonar-project.properties` prepared for real future use; ESLint (`eslint:recommended`) + manual `$regex` CWE-pattern grep executed as the practical substitute | `appendix/tools/sonar-project.properties`, `appendix/corrective/eslint/` |
| **Doxygen** | Not a natural fit for JS/JSX (C/C++/Java-oriented); binary unavailable in this environment anyway | Substituted with JSDoc 4.0.5 (the JS-ecosystem equivalent Doxygen's own docs point to for JS input) | `appendix/corrective/jsdoc/html/` |
| **IDA Pro** | Not applicable — no compiled binaries in an interpreted-JS project | Conceptual analog: black-box grep of the minified Vite bundle for hardcoded hosts | `appendix/adaptive/reverse-engineering/minified-bundle-blackbox-scan.md` |
| **IntelliJ IDEA** | Applicable, but GUI-only — this session is headless CLI | Exact menu paths documented for local reproduction; CLI-equivalent graphs generated with `madge` | §A.4, §B.4; `appendix/*/dependency-graph/` |
| **AST Explorer** | Applicable, but browser-only | Local equivalent via `espree` (same parser family) | `appendix/corrective/ast/` |
| **SnakeViz** | No Python component in Ghuroo itself, but Python/pip were available in this environment | Executed for real — `cProfile` + `snakeviz --server`, verified serving via `curl` (HTTP 200) | `appendix/corrective/profiling/` |
| **madge** *(supplementary, not explicitly named but standard for JS dependency graphs)* | Fully applicable | Executed for real against `api/` and `client/src` | `appendix/corrective/dependency-graph/`, `appendix/adaptive/dependency-graph/` |
| **ESLint** *(supplementary — already a project devDependency for `client/`)* | Fully applicable | Executed for real against `api/` (new maintenance-local config) and the specific changed `client/` files | `appendix/corrective/eslint/` |

Full reasoning for every substitution decision:
[`appendix/tools/TOOL_SUBSTITUTION_NOTES.md`](appendix/tools/TOOL_SUBSTITUTION_NOTES.md).

## Reproduce everything

```bash
# Corrective case
node maintenance/appendix/corrective/ast/generate-ast.mjs
node maintenance/appendix/corrective/repro-regex-bug.mjs
python maintenance/appendix/corrective/profiling/redos_impact_profile.py
snakeviz maintenance/appendix/corrective/profiling/redos_profile.prof   # interactive
npx madge --extensions js api --json
npx jsdoc -r api/controllers api/models api/routes api/utils -d /tmp/jsdoc-out

# Adaptive case
node maintenance/appendix/adaptive/change-management/repro-cors-portability.mjs
npx madge --extensions js,jsx client/src --json
```

## Change log (branches & commits)

| Branch | Base | Commit(s) |
|---|---|---|
| `corrective/tour-blog-search-regex-sanitization` | `main` | `e841e93` (fix), `68ea47c` (gitignore/artifact tracking) |
| `adaptive/env-driven-cors-and-runtime-pinning` | corrective branch | committed together with this report |

Both branches are merged into `main` at the end of this session (see
`MAINTENANCE_LOG.md` for the exact merge commands and final `git log`), so
the fixed code and this entire `maintenance/` folder are present on `main`
going forward, while the branch history is preserved for audit/rollback.

## Backlog — found during comprehension, intentionally not fixed this cycle

| Finding | Where | Why deferred |
|---|---|---|
| Duplicate `role` key in JSON responses | `api/controllers/auth.controller.js:78,121` | Harmless (same value twice), unrelated to either change's scope |
| Unused `previousBooking` variable | `api/controllers/booking.controller.js:150` | Cosmetic; also, `updateBookingStatus` doesn't null-check a missing booking id — a real latent bug, but a *different* corrective case from CM-01 |
| Unused `admin` variable | `api/controllers/tour.controller.js:62` | Cosmetic |
| Orphaned `Hero.jsx` component + dead import in `Home.jsx` | `client/src/components/Hero.jsx`, `client/src/pages/Home.jsx:3` | Dead code, zero runtime impact; deleting it is a legitimate future corrective/cleanup task but touches UI review, out of scope for a backend security fix |
| Unused `firebase-admin` dependency | root `package.json`, confirmed via `grep -ri firebase api/` (no hits) | Environment-coupling cleanup, own adaptive-maintenance candidate |
| Firebase client config hardcoded in source instead of `VITE_FIREBASE_*` env vars | `client/src/firebase.js` | Not a security defect (Firebase web config is meant to be public), but a documentation/implementation drift and natural follow-up to AM-01 |

---

# Part C — Preventive Maintenance (PM-01)

**Change:** Booking sub-system authorization hardening + input validation.  
**Session date:** 2026-08-17.  
**Branch:** `preventive/booking-auth-input-hardening` (commit `3c964bf`)

Preventive maintenance addresses vulnerabilities **before** they are exploited
in production. A proactive audit of the booking routes revealed that three
mutation endpoints (`POST /`, `DELETE /:id`, `GET /`) had no authentication
middleware at all — leaving the booking system open to impersonation and
unauthorized deletion.

---

## C.1 — Program Comprehension

*Full write-up:* [`appendix/preventive/PROGRAM_COMPREHENSION.md`](appendix/preventive/PROGRAM_COMPREHENSION.md)

**What was studied:** The data flow from browser → booking router → controller
→ MongoDB, and every trust boundary along the way.

**Key finding:** `createBooking` read `user_id` from `req.body` — a value
supplied by the client — instead of from the JWT-decoded `req.user.id`. This
meant any authenticated user could forge a booking for any other user ID.
`deleteBooking` had no ownership check whatsoever.

The `verifyUser` and `verifyAdmin` middlewares that protect every other
sensitive route in the system (tours, users) were simply never wired into
`booking.route.js`. This is a structural comprehension finding: the correct
pattern existed; it was not applied uniformly.

**Booking state machine (reconstructed):**
```
[pending] ──admin confirms──► [confirmed]
[pending] ──admin cancels ──► [cancelled]
[confirmed]──admin cancels──► [cancelled]
```

---

## C.2 — Change Management

*Full write-up:* [`appendix/preventive/change-management/CR-PM-01.md`](appendix/preventive/change-management/CR-PM-01.md)

**Change Request:** CR-PM-01 (2026-08-17, priority: High)

**Branch created:** `preventive/booking-auth-input-hardening` off `main`.

**Files changed:**

| File | Change |
|------|--------|
| `api/routes/booking.route.js` | `verifyUser`/`verifyAdmin` added to 5 routes |
| `api/controllers/booking.controller.js` | `user_id` sourced from JWT; ownership check in `deleteBooking` |
| `api/utils/validateBooking.js` | **New** — validates `number_of_persons`, `total_price`, `booking_date` |

**Verification gates:**
- POST without cookie → 401
- POST with another user's ID in body → booking attributed to JWT owner
- DELETE by non-owner → 403
- POST with `number_of_persons: 0` → 400
- POST with past `booking_date` → 400

---

## C.3 — Impact Analysis

*Full write-up:* [`appendix/preventive/IMPACT_ANALYSIS.md`](appendix/preventive/IMPACT_ANALYSIS.md)

| Scope | Impact |
|-------|--------|
| Backend routes | 5 of 7 booking routes now require auth |
| Controller logic | `user_id` derivation changed; one extra DB read in DELETE |
| Frontend | **Zero changes required** — all callers already send cookies |
| Database schema | **Unchanged** |
| Security posture | Impersonation, unauthorized delete, and bad-input attacks mitigated |

---

## C.4 — Reverse Engineering

*Full write-up:* [`appendix/preventive/REVERSE_ENGINEERING.md`](appendix/preventive/REVERSE_ENGINEERING.md)

From source code alone, the intended API contract was reconstructed:

- `POST /api/bookings` requires an authenticated user session; `user_id` must
  be derived from the JWT, not the body.
- `DELETE /api/bookings/:id` is for the booking *owner* or an admin.
- The trust hierarchy (anon → user → admin) was consistently applied
  everywhere except the booking router — a clear implementation gap relative
  to design intent.

The booking state machine and notification fan-out architecture were also
fully recovered and documented with no external reference.

---

## C.5 — Refactoring

*Full write-up:* [`appendix/preventive/REFACTORING.md`](appendix/preventive/REFACTORING.md)

**Patterns applied:**

1. **Extract Middleware** — validation rules extracted from the controller into
   `validateBooking.js`; the controller now handles business logic only.
2. **Replace Body Trust with Token Trust** — `user_id = req.user.id` replaces
   `user_id = req.body.user_id`, making the security contract explicit in code.
3. **Guard Clause** — early-return ownership check in `deleteBooking` keeps the
   happy path unindented and readable.
4. **Middleware Chain as Policy Document** — `booking.route.js` now reads as a
   readable access-control matrix for the entire booking sub-system.

---

# Part D — Perfective Maintenance (PFM-01)

**Change:** Pagination for `getAllTours` and `getAllBookings`.  
**Session date:** 2026-08-17.  
**Branch:** `perfective/tour-pagination` (commit `bfccacb`)

Perfective maintenance improves software quality, performance, and
maintainability **without fixing bugs**. The application is correct today;
PFM-01 makes it scalable.

---

## D.1 — Program Comprehension

*Full write-up:* [`appendix/perfective/PROGRAM_COMPREHENSION.md`](appendix/perfective/PROGRAM_COMPREHENSION.md)

**What was studied:** The `getAllTours` and `getAllBookings` endpoints —
specifically, what happens as the underlying MongoDB collections grow.

**Key finding:** Both endpoints execute unbounded `Model.find()` queries with
no `.limit()`. Every browse-page load fetches the *entire* collection into
Node heap, serializes it to JSON, and sends it over the wire.

**Growth projection:**

| Tours in DB | Response size | Serialization time |
|-------------|--------------|-------------------|
| 100 | ~200 KB | < 10 ms |
| 1 000 | ~2 MB | ~50 ms |
| 10 000 | ~20 MB | ~500 ms |

**Contrast with existing patterns:** `getFeaturedTours` already uses `.limit(6)`;
`getRecentReviewsByTour` uses `.limit(5)`. The pattern existed — it was just
not applied uniformly to the general listing endpoints.

---

## D.2 — Change Management

*Full write-up:* [`appendix/perfective/change-management/CR-PFM-01.md`](appendix/perfective/change-management/CR-PFM-01.md)

**Change Request:** CR-PFM-01 (2026-08-17, priority: Medium)

**Branch created:** `perfective/tour-pagination` off the preventive branch.

**Files changed:**

| File | Change |
|------|--------|
| `api/utils/paginate.js` | **New** — `parsePagination()` + `paginationEnvelope()` |
| `api/controllers/tour.controller.js` | `getAllTours` paginated; import added |
| `api/controllers/booking.controller.js` | `getAllBookings` paginated; import added |

**Response shape change (additive — backward compatible):**
```json
// Before
{ "success": true, "data": [ ...all tours... ] }

// After
{ "success": true, "count": 10, "page": 1, "totalPages": 4, "total": 38,
  "data": [ ...10 tours... ] }
```

---

## D.3 — Impact Analysis

*Full write-up:* [`appendix/perfective/IMPACT_ANALYSIS.md`](appendix/perfective/IMPACT_ANALYSIS.md)

| Scope | Impact |
|-------|--------|
| Frontend callers | **Zero breaking changes** — `response.data.data` path preserved |
| Database | One extra `countDocuments()` per request (fast, uses metadata) |
| Memory | Node heap load now bounded at `MAX_LIMIT = 100` documents |
| Network | Response size drops from unbounded to ~20 KB per page |

---

## D.4 — Reverse Engineering

*Full write-up:* [`appendix/perfective/REVERSE_ENGINEERING.md`](appendix/perfective/REVERSE_ENGINEERING.md)

The original API contract was reconstructed: `getAllTours` was written as if
the collection would always be small — an implicit assumption embedded in the
absence of `.limit()`. This was recovered only by reading the code and
comparing it with similar endpoints.

A further recovery finding: `tour.model.js` defines a full MongoDB text index
(`title`, `description`, `location`) but `searchTours` uses regex instead of
`$text` — the index exists but is unused. Logged as a future PFM-03 candidate.

---

## D.5 — Refactoring

*Full write-up:* [`appendix/perfective/REFACTORING.md`](appendix/perfective/REFACTORING.md)

**Patterns applied:**

1. **Extract Function** — pagination logic centralised in `paginate.js`. Any
   future endpoint adopts it in 3 lines (import + 2 function calls).
2. **Parallel Queries** — `Promise.all([find, countDocuments])` fetches data
   and total count concurrently, adding zero extra latency versus the old
   single-query approach.
3. **Consistent Return Shape** — `paginationEnvelope()` ensures every
   paginated endpoint returns the same JSON structure.
4. **Guard against infinite payloads** — `MAX_LIMIT = 100` prevents a caller
   from requesting the entire collection via `?limit=999999`.

---

## Final Git History (all four maintenance cycles)

```
bfccacb perf(api): PFM-01 paginate getAllTours and getAllBookings
3c964bf fix(api): PM-01 booking auth hardening + input validation
2301482 Merge pull request #1 from imtiaz-risat/main
41aa4bb docs(maintenance): finalize session log with merge/verification steps
0a1a026 feat(api): environment-driven CORS allow-list + Node engines pin
68ea47c chore: track maintenance/ JSON artifacts despite blanket *.json ignore
e841e93 fix(api): sanitize user input before MongoDB $regex in tour/blog search
7976560 Updated README.md
```

## Complete Appendix Index

| Maintenance Type | Activity | Artifact |
|---|---|---|
| Corrective (CM-01) | Program Comprehension | `appendix/corrective/` (AST dump, madge graph) |
| Corrective (CM-01) | Change Management | `appendix/corrective/change-management/CR-2026-07-10-01.md` |
| Corrective (CM-01) | Impact Analysis | `appendix/corrective/profiling/` (ReDoS timing curves) |
| Corrective (CM-01) | Reverse Engineering | `appendix/corrective/jsdoc/` (JSDoc HTML) |
| Corrective (CM-01) | Refactoring | `api/utils/escapeRegex.js` (extracted utility) |
| Adaptive (AM-01) | Program Comprehension | `appendix/adaptive/` (madge graph, bundle scan) |
| Adaptive (AM-01) | Change Management | `appendix/adaptive/change-management/CR-2026-07-10-02.md` |
| Adaptive (AM-01) | Impact Analysis | 50 fetch() call sites across 27 frontend files |
| Adaptive (AM-01) | Reverse Engineering | Deployment topology Mermaid diagram |
| Adaptive (AM-01) | Refactoring | `api/index.js` env-driven CORS; `package.json` engines pin |
| Preventive (PM-01) | Program Comprehension | `appendix/preventive/PROGRAM_COMPREHENSION.md` |
| Preventive (PM-01) | Change Management | `appendix/preventive/change-management/CR-PM-01.md` |
| Preventive (PM-01) | Impact Analysis | `appendix/preventive/IMPACT_ANALYSIS.md` |
| Preventive (PM-01) | Reverse Engineering | `appendix/preventive/REVERSE_ENGINEERING.md` |
| Preventive (PM-01) | Refactoring | `appendix/preventive/REFACTORING.md`; `api/utils/validateBooking.js` |
| Perfective (PFM-01) | Program Comprehension | `appendix/perfective/PROGRAM_COMPREHENSION.md` |
| Perfective (PFM-01) | Change Management | `appendix/perfective/change-management/CR-PFM-01.md` |
| Perfective (PFM-01) | Impact Analysis | `appendix/perfective/IMPACT_ANALYSIS.md` |
| Perfective (PFM-01) | Reverse Engineering | `appendix/perfective/REVERSE_ENGINEERING.md` |
| Perfective (PFM-01) | Refactoring | `appendix/perfective/REFACTORING.md`; `api/utils/paginate.js` |
