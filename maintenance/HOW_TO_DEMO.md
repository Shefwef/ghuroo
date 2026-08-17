# How to Demonstrate the Maintenance Simulations

All commands are run from the **project root** (`ghuroo/`).

## Prerequisites

```bash
# one-time — install express + cors so the demo servers can start
npm install express cors --no-save
```

---

## 1 — Corrective Maintenance (CM-01): ReDoS Vulnerability Fix

**What it shows:** searching tours with `C++ tour` crashes the server before
the fix; `escapeRegex` neutralises it after.

```bash
node maintenance/appendix/corrective/repro-regex-bug.mjs
```

Expected: `CRASH "C++ tour"` in the BEFORE section; all `OK` in the AFTER section.

**Profiling evidence** (ReDoS timing 0.1ms → 2089ms):
```bash
python maintenance/appendix/corrective/profiling/redos_impact_profile.py
```

**Code diff:**
```bash
cat maintenance/appendix/corrective/change-management/code-fix.diff
```

---

## 2 — Adaptive Maintenance (AM-01): Environment-Driven CORS

**What it shows:** hardcoded CORS rejects new origins; env-var config accepts
them without a code change.

```bash
node maintenance/appendix/adaptive/change-management/repro-cors-portability.mjs
```

Expected:
- OLD config: `https://ghuroo.app` → `(absent = blocked)`
- NEW config (ALLOWED_ORIGINS unset): same as OLD (backward-compatible)
- NEW config (ALLOWED_ORIGINS set): `https://ghuroo.app` → allowed

---

## 3 — Preventive Maintenance (PM-01): Booking Auth Hardening

**What it shows:** before PM-01 any caller can impersonate another user,
send negative prices, or make bookings for past dates without authentication.

```bash
node maintenance/appendix/preventive/repro-booking-auth.mjs
```

Expected highlights:
- Test 1: BEFORE `booked_as=user-bob-999` (victim) → AFTER `booked_as=user-alice-001` (JWT owner)
- Test 2: BEFORE `status=201` (no auth) → AFTER `status=401 Not authenticated!`
- Test 3: BEFORE `status=201` (-1 persons accepted) → AFTER `status=400` validation error
- Test 4: BEFORE `status=201` (-500 price accepted) → AFTER `status=400` validation error
- Test 5: BEFORE `status=201` (past date accepted) → AFTER `status=400` validation error
- Test 6: happy path → `status=201` both before and after

**Code diff:**
```bash
cat maintenance/appendix/preventive/change-management/pm01-code.diff
```

---

## 4 — Perfective Maintenance (PFM-01): Tour Listing Pagination

**What it shows:** the pagination utility works correctly across all edge
cases (defaults, clamping, non-numeric input) and the before/after response
shape.

```bash
node maintenance/appendix/perfective/repro-pagination.mjs
```

Expected highlights:
- Test 1: `?` → `{ page: 1, limit: 10, skip: 0 }` (defaults)
- Test 3: `?limit=999` → `limit: 100` (capped)
- Test 6: envelope has `success, count, page, totalPages, total, data`
- Test 7: BEFORE = full collection; AFTER = fixed 20 KB page
- Test 8: 38 docs at limit=15 → 3 pages with correct boundaries

**Code diff:**
```bash
cat maintenance/appendix/perfective/change-management/pfm01-code.diff
```

---

## Reading the full report

```bash
# Primary deliverable — all four maintenance types, five activities each
cat maintenance/MAINTENANCE_REPORT.md

# Raw session diary with exact commands and tool output
cat maintenance/MAINTENANCE_LOG.md
```

---

## Git history (all four maintenance cycles)

```bash
git log --oneline
```

| Commit | What |
|--------|------|
| `ff0b4ae` | QA: demo scripts, auth gap fix, output files |
| `50a6c31` | Docs: extend report with PM-01 + PFM-01 |
| `bfccacb` | PFM-01: paginate getAllTours + getAllBookings |
| `3c964bf` | PM-01: booking auth hardening + input validation |
| `0a1a026` | AM-01: env-driven CORS allow-list + Node engines pin |
| `68ea47c` | Chore: track maintenance JSON artifacts |
| `e841e93` | CM-01: sanitize user input before MongoDB \$regex |
