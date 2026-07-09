# Maintenance Session Log — Ghuroo (MERN Travel & Tourism Platform)

This file is a running, chronological log of every maintenance activity performed
in this `maintenance/` workspace: what was investigated, which tools were run,
what commands were used, and what their exact output was. The two full case
studies (narrative + analysis) live in:

- [`01-corrective-maintenance.md`](01-corrective-maintenance.md)
- [`02-adaptive-maintenance.md`](02-adaptive-maintenance.md)

This log is the raw diary; the two case-study documents are the polished
write-ups that reference back into `appendix/` artifacts produced here.

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
| AST Explorer | Program comprehension / reverse engineering | browser-only (astexplorer.net) | local equivalent generated with `@babel/parser`, same AST shape it would show, saved as JSON + annotated Markdown |
| SnakeViz | Impact analysis (profiling) | installable via pip (Python present) | **executed for real** — see profiling section |
| madge | not explicitly named, but is a standard dependency-graph tool for JS covered by "etc." | installable via `npx` | **executed for real** |
| ESLint | not explicitly named, standard static analysis, project already depends on it for `client/` | already a devDependency | **executed for real**, extended to `api/` with a maintenance-local config |

---

## Log entries
