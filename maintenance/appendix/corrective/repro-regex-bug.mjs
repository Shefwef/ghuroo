// Standalone, DB-free reproduction of CM-01 (see 01-corrective-maintenance.md).
//
// MongoDB compiles the string given to `$regex` into a PCRE pattern using the
// exact same metacharacter rules as JavaScript's RegExp engine. So the failure
// mode of `{ title: { $regex: term } }` can be reproduced locally, without a
// database, by doing the equivalent `new RegExp(term)` compilation step that
// the MongoDB driver performs internally.
//
// Run:  node maintenance/appendix/corrective/repro-regex-bug.mjs
import { escapeRegex } from "../../../api/utils/escapeRegex.js";

const searchTermsUsersActuallyType = [
  "Cox's Bazar",         // apostrophe - harmless either way (control case)
  "St. John's (old)",    // '.' silently widens the match; balanced parens don't crash but change semantics
  "C++ tour",             // BEFORE: throws SyntaxError ("Nothing to repeat") -> 500 response
  "[Sale] Sajek",          // '[Sale]' is parsed as a character class, not literal text -> wrong results, no crash
  "tour (a+)+$ deal",      // syntactically valid but is the classic catastrophic-backtracking shape;
                           // see profiling/ for the quantified CPU-time blow-up on crafted input
];

function beforeFix(term) {
  // This is exactly what tour.controller.js#searchTours did prior to CM-01:
  // the raw user string was handed straight to $regex.
  return new RegExp(term, "i"); // throws on unbalanced/invalid metacharacters
}

function afterFix(term) {
  // This is what it does now: escapeRegex() neutralises metacharacters first.
  return new RegExp(escapeRegex(term), "i");
}

console.log("=== BEFORE FIX (api/controllers/tour.controller.js, pre-CM-01) ===");
for (const term of searchTermsUsersActuallyType) {
  try {
    const re = beforeFix(term);
    console.log(`OK    "${term}" -> ${re}`);
  } catch (err) {
    console.log(`CRASH "${term}" -> ${err.name}: ${err.message}`);
  }
}

console.log("\n=== AFTER FIX (escapeRegex applied) ===");
for (const term of searchTermsUsersActuallyType) {
  try {
    const re = afterFix(term);
    console.log(`OK    "${term}" -> ${re}`);
  } catch (err) {
    console.log(`CRASH "${term}" -> ${err.name}: ${err.message}`);
  }
}
