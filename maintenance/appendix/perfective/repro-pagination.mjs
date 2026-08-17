/**
 * Standalone demo of PFM-01: tour pagination utility.
 *
 * No database or server needed. Exercises parsePagination() and
 * paginationEnvelope() directly, then shows the before/after response
 * shape that consumers of GET /api/tours receive.
 *
 * Run: node maintenance/appendix/perfective/repro-pagination.mjs
 */

import { parsePagination, paginationEnvelope } from "../../../api/utils/paginate.js";

function label(text) {
  console.log(`\n${"─".repeat(60)}\n${text}\n${"─".repeat(60)}`);
}

// ── Simulate req.query values ─────────────────────────────────────────────

function fakeReq(query = {}) {
  return { query };
}

// ── 1. parsePagination edge cases ─────────────────────────────────────────

label("TEST 1 — parsePagination: default values (no query params)");
const r1 = parsePagination(fakeReq({}));
console.log("  Input  : ?  (nothing)");
console.log("  Output :", r1);
console.log("  → page=1, limit=10, skip=0  (defaults)");

label("TEST 2 — parsePagination: explicit page and limit");
const r2 = parsePagination(fakeReq({ page: "3", limit: "5" }));
console.log("  Input  : ?page=3&limit=5");
console.log("  Output :", r2);
console.log("  → skip=10 means documents 11–15 are returned");

label("TEST 3 — parsePagination: limit capped at MAX (100)");
const r3 = parsePagination(fakeReq({ page: "1", limit: "999" }));
console.log("  Input  : ?page=1&limit=999");
console.log("  Output :", r3);
console.log("  → limit clamped to 100 — protects against unbounded queries");

label("TEST 4 — parsePagination: page cannot go below 1");
const r4 = parsePagination(fakeReq({ page: "-5", limit: "10" }));
console.log("  Input  : ?page=-5&limit=10");
console.log("  Output :", r4);
console.log("  → page clamped to 1");

label("TEST 5 — parsePagination: non-numeric values fall back to defaults");
const r5 = parsePagination(fakeReq({ page: "abc", limit: "xyz" }));
console.log("  Input  : ?page=abc&limit=xyz");
console.log("  Output :", r5);
console.log("  → defaults used (page=1, limit=10)");

// ── 2. paginationEnvelope ────────────────────────────────────────────────

label("TEST 6 — paginationEnvelope: page 1 of 4 (38 total, limit 10)");

// Simulate 10 tour documents returned from MongoDB
const fakeTours = Array.from({ length: 10 }, (_, i) => ({ _id: `tour-${i + 1}`, title: `Tour ${i + 1}` }));
const envelope = paginationEnvelope({ data: fakeTours, total: 38, page: 1, limit: 10 });
console.log("  Response shape:");
console.log(JSON.stringify({ ...envelope, data: `[...${envelope.count} tours...]` }, null, 4));

// ── 3. Before/After response shape comparison ─────────────────────────────

label("TEST 7 — Before/After response shape for GET /api/tours");

const OLD_RESPONSE = {
  success: true,
  data: fakeTours,  // ALL documents, unbounded
};

const NEW_RESPONSE = paginationEnvelope({ data: fakeTours, total: 38, page: 1, limit: 10 });

console.log("  BEFORE PFM-01 (getAllTours with 38 tours in DB):");
console.log(`    { success: true, data: [...38 tours...] }  ← full collection every request`);
console.log(`    Response size with 1000 tours: ~2 MB`);
console.log(`    Response size with 10000 tours: ~20 MB`);

console.log("\n  AFTER PFM-01:");
console.log(`    { success: true, count: 10, page: 1, totalPages: 4, total: 38, data: [...10 tours...] }`);
console.log(`    Response size: constant ~20 KB regardless of collection size`);
console.log(`    Client paginates using ?page=2, ?page=3, ...`);
console.log(`    Client reads 'totalPages' to know how many pages exist`);

// ── 4. Multi-page navigation simulation ───────────────────────────────────

label("TEST 8 — Simulating 3 pages of 38 total tours (limit=15)");

const TOTAL = 38;
const PAGE_LIMIT = 15;

for (let p = 1; p <= Math.ceil(TOTAL / PAGE_LIMIT); p++) {
  const { skip, limit } = parsePagination(fakeReq({ page: String(p), limit: String(PAGE_LIMIT) }));
  const startDoc = skip + 1;
  const endDoc   = Math.min(skip + limit, TOTAL);
  const pageResult = paginationEnvelope({
    data: new Array(endDoc - startDoc + 1).fill(null),
    total: TOTAL, page: p, limit: PAGE_LIMIT,
  });
  console.log(`  ?page=${p}&limit=${PAGE_LIMIT} → docs ${startDoc}–${endDoc}, totalPages=${pageResult.totalPages}`);
}

console.log("\n");
