# Maintenance Session Log — Ghuroo (MERN Travel & Tourism Platform)

This file is a running, chronological log of every maintenance activity performed
in this `maintenance/` workspace: what was investigated, which tools were run,
what commands were used, and what their exact output was. The polished,
serially-organized deliverable (both maintenance types, five activities each,
appendix at the end) lives in:

- [`MAINTENANCE_REPORT.md`](MAINTENANCE_REPORT.md)

This log is the raw diary; `MAINTENANCE_REPORT.md` is the write-up that
references back into the `appendix/` artifacts produced here.

Environment snapshot at session start (2026-07-10):

| Tool | Requested by assignment | Availability in this environment | Resolution |
|---|---|---|---|
| Node.js | — | v22.16.0 | used directly |
| npm | — | 11.7.0 | used directly |
| Python | snakeviz runtime | 3.12.8 (`python`), pip 26.0 | used directly |
| Docker | SonarQube / Doxygen containers | Docker CLI 27.3.1 present, **daemon unreachable** (`dockerDesktopLinuxEngine` pipe not found — Docker Desktop not running) | substituted, see tool notes below |
| `sonar-scanner` CLI | SonarQube | not installed, no reachable Sonar server | `sonar-project.properties` prepared; ESLint + manual CWE-pattern audit executed instead; see [`appendix/tools/TOOL_SUBSTITUTION_NOTES.md`](appendix/tools/TOOL_SUBSTITUTION_NOTES.md) |
| `doxygen` | Reverse engineering | binary not found on PATH, no package manager available without admin rights | JSDoc used instead (native to the JS/JSX stack; Doxygen's own docs recommend JSDoc-style comments for JS anyway) |
| IDA Pro | Reverse engineering | GUI-only, licensed, N/A to interpreted JS source | conceptual analog performed instead: black-box string/structure recovery from the **minified production bundle** `client/dist/assets/index-71cf8e48.js` (the closest thing this project has to a "binary artifact" with no readable source) |
| IntelliJ IDEA | Reverse engineering | GUI IDE, not scriptable headlessly in this shell | exact menu paths documented so the user can reproduce the diagrams locally; CLI-equivalent graphs generated with `madge`/AST dump for the artifacts that must ship in this document |
| AST Explorer | Program comprehension / reverse engineering | browser-only (astexplorer.net) | local equivalent generated with `espree` (same parser family ESLint/astexplorer.net use, borrowed from `client/node_modules`), same AST shape it would show, saved as JSON + annotated Markdown |
| SnakeViz | Impact analysis (profiling) | installable via pip (Python present) | **executed for real** — see profiling section |
| madge | not explicitly named, but is a standard dependency-graph tool for JS covered by "etc." | installable via `npx` | **executed for real** |
| ESLint | not explicitly named, standard static analysis, project already depends on it for `client/` | already a devDependency | **executed for real**, extended to `api/` with a maintenance-local config |

---

## Log entries

### 1. Repository survey

Explored the project tree (`api/` Express backend, `client/` Vite+React
frontend), read `README.md`, and read `package.json` at root and in
`client/`. Confirmed: MERN travel/tourism app, CRUD for tours/bookings/
blogs/reviews, separate user and admin surfaces, deployed as a single Render
service at `https://ghuroo.onrender.com/`.

### 2. Tool-availability probe

Ran, in order: `node --version`, `npm --version`, `python --version`,
`java -version`, `doxygen --version`, `docker --version`, `sonar-scanner
--version`, `git --version`. Result: Node 22.16.0, npm 11.7.0, Python 3.12.8,
OpenJDK 21 present; `doxygen` and `sonar-scanner` not on PATH. Followed up
with `docker info` — CLI present (27.3.1) but the daemon pipe
(`dockerDesktopLinuxEngine`) is unreachable, so no local SonarQube/Doxygen
container could be started. Checked `dot -V` (Graphviz, for rendering madge's
`.dot` output to an image) — also not installed; `.dot` files were kept in
text form instead of rendered to PNG/SVG. Checked `pip`/`py` — both present,
which is what made the SnakeViz step viable for real. Confirmed npm registry
reachability (`npm ping` → PONG) so `npx`-based tools (madge, jsdoc) could
fetch on demand without pre-installing them as project dependencies.

### 3. Candidate defect/change hunt

Read `api/controllers/tour.controller.js`, `tour.route.js`, and
`booking.controller.js` looking for a genuine, reproducible defect suitable
for the corrective case (rather than inventing one). Found `searchTours`
building a MongoDB `$regex` filter directly from `req.params.term` with no
escaping. Cross-checked git history (`git log --oneline -20`) — the search
feature is recent (`050173c`, `e2bd36e`), which is exactly the kind of
recently-shipped, user-input-driven code a maintenance sweep should
prioritize. `grep -rn '\$regex' api` then found the same unescaped pattern in
`getToursByLocation` (same file) and `searchBlogs`
(`blog.controller.js`) — three functions, four call sites, two files. This
became **CM-01**.

Read `api/index.js`, `client/vite.config.js`, and `api/config/db.js` looking
for an environment-coupling issue suitable for the adaptive case. Found the
CORS middleware hardcoding a single allowed origin per `NODE_ENV`
(`https://ghuroo.onrender.com` / `http://localhost:5173`, with a comment
"// Fixed CORS configuration" implying this was already patched once from
something more permissive). This became **AM-01**.

Also noted, in passing (logged to the report's Backlog, not fixed): a
Firebase package-version mismatch between root (`firebase ^11.9.1`) and
`client` (`firebase ^10.14.1`); confirmed via later grep that
`firebase`/`firebase-admin` are never actually imported anywhere in `api/`
despite being root dependencies.

### 4. Folder scaffold

Created `maintenance/` with `appendix/{corrective,adaptive,tools}/...`
subfolders (see repo for final tree) before writing any code fix, so every
artifact produced from this point has a home.

### 5. Git branch `corrective/tour-blog-search-regex-sanitization`

Created off `main` (`git checkout -b ...`). Verified `git status --short`
was clean apart from the new `maintenance/` folder before branching.

Implemented `api/utils/escapeRegex.js` and applied it at all four sink sites
in `tour.controller.js` (`searchTours`, `getToursByLocation`) and
`blog.controller.js` (`searchBlogs`). Verified with `node --check` on all
three touched files.

Wrote and ran `appendix/corrective/repro-regex-bug.mjs` — a DB-free repro
using `new RegExp(term)` (the same compilation MongoDB's driver performs
internally for `$regex`). Real finding: `"C++ tour"` throws
`SyntaxError: Invalid regular expression: Nothing to repeat` pre-fix; all
five sample terms parse cleanly post-fix (escaped). One sample term,
`"tour (a+)+$ deal"`, is syntactically *valid* but is the classic
catastrophic-backtracking shape — carried forward into the profiling step.

Generated the AST equivalent of AST Explorer for the pre-fix `searchTours`
snippet: `appendix/corrective/ast/generate-ast.mjs` uses `createRequire` to
borrow `espree` from `client/node_modules` (avoided adding a new project
dependency just for this). First attempt used a wrong relative path depth
(`../../../client/x.cjs` instead of `../../../../client/x.cjs`, since the
script lives 4 levels under `maintenance/`) and failed with
`Cannot find module 'espree'`; fixed the path depth and it produced a 145-node
AST plus an annotated depth-first walk flagging the taint source
(`req.params.term`) and all three `$regex` sinks.

Ran `npx madge --extensions js api --json`, `--dot`, and `--circular`
(37 files processed, no circular dependencies). Queried the resulting JSON
with a small inline Node script to confirm only `tour.route.js` /
`blog.route.js` import the two changed controllers.

Grepped client source for callers of the three affected endpoints
(`grep -n` for `/api/(tours|blogs)/search` and `/api/tours/location`) —
found `Home.jsx`, `Tours.jsx`, `DestinationDetails.jsx` call the tour
endpoints; **no file** calls the blog search endpoint. Separately grepped
`Blogs.jsx` for any "search" reference — none — confirming `searchBlogs` is
reachable but has zero current UI callers.

Ran `npx jsdoc -r api/controllers api/models api/routes api/utils -d
appendix/corrective/jsdoc/html` (JSDoc 4.0.5) — succeeded, produced a full
HTML doc site (Doxygen substitute — binary unavailable per step 2).

Created `appendix/corrective/eslint/api.eslintrc.json`
(`eslint:recommended`, Node/ES2022) since `api/` had no lint config at all,
and ran it via `client/node_modules/.bin/eslint --no-eslintrc -c ...` against
`api/` — real findings: duplicate `role` keys in `auth.controller.js`
(harmless), unused `previousBooking`/`admin`/`join`/`next` variables. None
are the defect being fixed; logged to the report's backlog. Also ran the
client's own existing ESLint config against `Home.jsx` and `Hero.jsx`
specifically — found `Hero` imported-but-never-rendered in `Home.jsx`
(confirms a second, dead, non-functional search UI exists in the codebase;
not touched, logged to backlog).

Installed SnakeViz (`pip install --user snakeviz` — already satisfied) and
wrote `appendix/corrective/profiling/redos_impact_profile.py`. First version
used fixed subject lengths up to 28 with no safety bound, which risked a
runaway (catastrophic backtracking is O(2^n)); rewrote to grow `n` adaptively
and stop once a single match exceeds a 1.5s wall-clock cap. Ran it: blow-up
from 0.103ms (n=10) to 2089.194ms (n=26) before the fix, flat ~0.001ms after,
across all measured lengths — profiled the n=26 case with `cProfile`, dumped
a `.prof` file and a `pstats` text report. Then ran `python -m snakeviz
--server` against the `.prof` file in the background, confirmed it actually
serves the visualization with `curl` (HTTP 200, correct page title), saved
the rendered HTML as evidence, and killed the server process by PID
afterward (`taskkill //F //PID <pid>`) to leave no background process
running.

Wrote the Change Request `appendix/corrective/change-management/
CR-2026-07-10-01.md` and saved the code diff
(`git diff -- api/ > .../code-fix.diff`).

Staged and committed (`git add`, `git commit`). Discovered post-commit that
four generated `.json` artifacts (AST dump, madge JSON, ESLint JSON report,
the maintenance-local `.eslintrc.json`) were silently dropped — the
project's root `.gitignore` has a blanket `*.json` rule (line 28,
pre-existing, unrelated to this session). Deleted two now-redundant empty
`.log` files, added a scoped `!maintenance/**/*.json` negation to
`.gitignore`, force-added the four files (`git add -f`), and committed the
fix as a second, separate commit rather than amending the first (per
standard practice: the first commit already "happened" from git's
perspective).

### 6. Git branch `adaptive/env-driven-cors-and-runtime-pinning`

Created **on top of** the corrective branch (not off `main` again) so both
maintenance cycles' artifacts accumulate in the same `maintenance/` tree
without duplicating shared files.

Inspected env var names (values redacted with `sed`) in `api/.env` and root
`.env` to build an accurate, secret-free `.env.example` — confirmed
`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MONGO_URL` are the actual
keys in use (no `NODE_ENV`/`PORT` committed to the file — those are set at
the hosting-platform level).

Checked `node_modules/*/package.json` `engines` fields for the project's
actual direct dependencies rather than guessing a Node version floor:
`firebase-admin` → `>=18` (strictest), `mongoose` → `>=14.20.1`, `express` →
`>=0.10.0`, `multer` → `>=10.16.0`, `firebase`/`@supabase/supabase-js` → none
declared. Used `>=18` for the new `engines` field in root `package.json` —
evidence-based, not arbitrary.

Edited `api/index.js`: replaced the hardcoded CORS origin ternary with an
`ALLOWED_ORIGINS`-env-driven allow-list that falls back to the exact previous
defaults when unset. Verified with `node --check`.

Wrote `appendix/adaptive/change-management/repro-cors-portability.mjs` — spun
up three real Express + `cors` servers (old config; new config with the env
var unset; new config with the env var set to two origins) on ports
4101–4103 and made real HTTP requests with different `Origin` headers via
Node's `http` module. Confirmed byte-for-byte identical
`access-control-allow-origin` behaviour between old code and new-code-with-
unset-env-var (the required regression check), and that a new origin is
accepted only once explicitly configured.

Black-box-scanned `client/dist/assets/index-71cf8e48.js` (the IDA Pro analog
— see tool notes) without reading `client/src`: `grep -oE
'https?://[a-zA-Z0-9./_-]+'` and `grep -o '"/api[^"]*"'`. Initially tried to
find the literal string `/api/tours/search` and got zero hits, which looked
like a discrepancy — investigated with `git log -- client/dist` and found
this path is untracked (matches the bare `dist` rule in `.gitignore`), i.e.
it's a locally-built, stale artifact predating the search feature, not a
sign of a real problem. The core finding still holds: every absolute URL in
the bundle belongs to a third-party SDK, and every backend call recovered
(`"/api/auth/google"`, etc.) is a bare relative path with no origin baked
in — confirming the client needs no changes for AM-01.

Ran `npx madge --extensions js,jsx client/src --json` (42 modules, no
errors) and `--dot`, then counted `fetch(...)` call sites referencing
`/api` across `client/src` (`grep -roE "fetch\([^)]*"` piped to `grep -c
"api"`) → 50 call sites across 27 files, cited in the impact analysis as the
size of the blast radius the single CORS gate protects.

Wrote the deployment-topology reverse-engineering writeup (with a Mermaid
diagram) and the Change Request
`appendix/adaptive/change-management/CR-2026-07-10-02.md`.

### 7. Report authoring

Wrote the single, serially-organized deliverable `MAINTENANCE_REPORT.md`
(Part A = corrective, Part B = adaptive, five subsections each, Appendix at
the end indexing every tool/artifact) and this log's narrative section.
Removed one stray empty `snakeviz_server.log` file left over from step 5
(gitignored anyway, no evidentiary value).

### 8. Final commit & merge

Committed the adaptive branch:

```
git add api/index.js api/.env.example package.json maintenance/
git commit   # 0a1a026 "feat(api): environment-driven CORS allow-list + Node engines pin"
```

Merged both branches into `main` (fast-forward, since `main` had not moved
since the corrective branch was cut from it, and the adaptive branch already
contains the corrective branch's commits):

```
git checkout main
git merge adaptive/env-driven-cors-and-runtime-pinning --ff-only
```

Result: `Fast-forward`, `main` now at `0a1a026`, working tree clean
(`git status --short` → no output). Final history:

```
0a1a026 feat(api): environment-driven CORS allow-list + Node engines pin
68ea47c chore: track maintenance/ JSON artifacts despite blanket *.json ignore
e841e93 fix(api): sanitize user input before MongoDB $regex in tour/blog search
7976560 Updated README.md   <- main before this session
```

Both feature branches (`corrective/tour-blog-search-regex-sanitization`,
`adaptive/env-driven-cors-and-runtime-pinning`) were left in place rather
than deleted, so the per-cycle commit boundaries remain individually
revertable/auditable even though their content is now also on `main`.
**Nothing was pushed to any remote** — `main` is only ahead of
`origin/main` locally; push is left to the user's discretion.
