# Tool Applicability & Substitution Notes

The assignment names a specific toolset from the course: **IDA Pro, Doxygen,
IntelliJ IDEA, AST Explorer, SnakeViz, SonarQube**. Ghuroo is a 100%
JavaScript/JSX MERN application with no compiled binaries and no Python
components, so several of these tools do not apply in their literal, textbook
form. Below is, tool by tool, what was actually run in this session, what was
substituted, and why — so the reasoning is auditable rather than asserted.

## SonarQube — substituted, config prepared for real use

**Attempted:** `docker info` was run first to check for a reachable daemon.
Result:

```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.47/info":
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

Docker Desktop is installed (CLI v27.3.1 responds) but its engine is not
running in this sandboxed session, and there is no separately reachable Sonar
server or `sonar-scanner` binary. Spinning up SonarQube's own container stack
(app + embedded Elasticsearch, several hundred MB, ~2 minutes cold start) was
judged out of scope for a non-interactive session with no persistent daemon.

**Substituted with:** ESLint (`eslint:recommended`) run directly against
`api/` (config created at `../corrective/eslint/api.eslintrc.json` since the
API had no lint config at all) and against the changed `client/` files using
the project's existing `.eslintrc.cjs`, plus a manual grep-based sweep for the
`$regex` taint pattern (the same technique a SonarQube custom rule or its
built-in `javascript:S5852` rule would flag automatically). `sonar-project.properties`
is included in `../tools/` — ready to run for real the moment a Sonar server
is reachable, with the specific rule IDs (`S5852`, `S1128`/no-unused-vars
family) that would reproduce this session's findings called out in the file's
comments.

## Doxygen — substituted with JSDoc

**Attempted:** `doxygen --version` → `command not found`; no admin rights in
this session to install via a package manager, and no verified Doxygen Docker
image was pulled given the same Docker-daemon issue above.

**Substituted with:** [JSDoc](https://jsdoc.app/) 4.0.5, run via `npx jsdoc`
against `api/controllers`, `api/models`, `api/routes`, `api/utils`. This is
not a compromise so much as the *correct* tool for this stack — Doxygen's own
manual recommends JSDoc-style `/** */` comment blocks for JS input and mainly
adds value over JSDoc for polyglot C/C++/Java codebases, which this project
is not. Output: `../corrective/jsdoc/html/` (open `index.html`).

## IDA Pro — not applicable; conceptual analog performed

IDA Pro disassembles/decompiles **compiled binaries** (PE/ELF/Mach-O,
firmware, etc.) — it has no meaningful role against interpreted JS source that
already ships as source. There is exactly one artifact in this repo that is
"binary-like" in the relevant sense (opaque, not meant to be read, only
produced by a build step): the Vite production bundle,
`client/dist/assets/index-71cf8e48.js` (minified, no source map committed).
Reverse-engineering that bundle **without** looking at `client/src` — locating
a known UI string, walking outward to recover the surrounding minified
function boundaries — is the closest same-shape exercise to what IDA Pro is
used for (black-box structure recovery from a build artifact with no
source), and is carried out in
[`02-adaptive-maintenance.md`](../../02-adaptive-maintenance.md) §4
(Reverse Engineering) since it also motivates the adaptive-maintenance
environment-portability case (the bundle hardcodes nothing environment
specific — confirmed *by* this exercise, not assumed).

## IntelliJ IDEA — GUI steps documented, CLI-equivalent artifacts generated

This session runs headlessly in a terminal with no IntelliJ instance
attached, so its diagramming features (Diagrams → Show Diagram, dependency
matrix) cannot literally be invoked here. What's provided instead:

1. Exact IntelliJ menu paths in both case studies so the reader can reproduce
   the same view locally (e.g. right-click `api/models` → *Diagrams → Show
   Diagram* to get a live Mongoose schema-relationship graph).
2. A CLI-generated equivalent for the artifact that has to ship *in* this
   document: `madge` dependency graphs (`../corrective/dependency-graph/`,
   `../../appendix/adaptive/dependency-graph/`), which IntelliJ's own
   dependency diagram is built from the same underlying import graph.

## AST Explorer — executed locally (equivalent parser, same output shape)

astexplorer.net is a browser app with no CLI/API for headless use. Its output
is simply the AST that `espree` (or Acorn/Babel) produces for the pasted
snippet — and `espree` is already a transitive dependency of this project's
own ESLint setup (`client/node_modules/espree`), so it was invoked directly
via a small Node script
(`../corrective/ast/generate-ast.mjs`) against the pre-fix `searchTours`
snippet. The JSON AST and an annotated depth-first walk (flagging the taint
source and the `$regex` sink nodes) are saved in `../corrective/ast/` — the
same information AST Explorer's tree pane shows, just captured to a file
instead of a browser tab.

## SnakeViz — executed for real

Python 3.12.8 and pip were both present, so `snakeviz` was installed
(`pip install --user snakeviz`, already satisfied) and used for real: a
profiling script (`../corrective/profiling/redos_impact_profile.py`) runs
`cProfile` over the ReDoS scenario described in the corrective case study,
dumps a `.prof` file, and `python -m snakeviz --server` was started against it
and queried with `curl` to confirm it serves the visualization (HTTP 200,
rendered page saved as `../corrective/profiling/snakeviz_rendered_page.html`)
before being shut down. Python has no runtime role in Ghuroo itself; it is
used here purely as the *measurement instrument* for the availability-impact
analysis, since catastrophic-backtracking regex behaviour is engine-agnostic
(the same `(a+)+$` shape is pathological in PCRE, V8's RegExp, and Python's
`re`) and this is the profiling toolchain specified for the exercise.
