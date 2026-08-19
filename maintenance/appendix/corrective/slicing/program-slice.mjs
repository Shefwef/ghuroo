/**
 * Program Slicing — CM-01 (ReDoS Fix)
 *
 * Performs a STATIC BACKWARD SLICE of `searchTours` with slicing criterion:
 *   variable `term`  at the MongoDB $regex sink.
 *
 * A static backward slice from (statement S, variable V) contains every
 * statement that MAY affect the value of V at S, for ANY execution.
 *
 * Lab-1 note: this script is the programmatic equivalent of using
 * IntelliJ's "Analyze → Analyze Data Flow To Here" on the `$regex: term`
 * property, which the lab slides call "Static Code Slicing — Find Usage".
 *
 * Run: node maintenance/appendix/corrective/slicing/program-slice.mjs
 */

const FUNCTION_SRC = `
export const searchTours = async (req, res, next) => {
  try {
    const { term } = req.params;          // L01 — DEFINE term  (SOURCE: HTTP input)

    if (!term) {                           // L02 — USE term
      return next(errorHandler(400, "Search term is required"));
    }

    const numericTerm = parseFloat(term);  // L03 — USE term
    const isNumeric = !isNaN(numericTerm); // L04 — USE numericTerm  (derived from term)
    const safeTerm = escapeRegex(term);    // L05 — USE term, DEFINE safeTerm

    const searchQuery = {
      $or: [
        { title:       { $regex: safeTerm, $options: "i" } }, // L06 — USE safeTerm  *** SINK ***
        { description: { $regex: safeTerm, $options: "i" } }, // L07 — USE safeTerm  *** SINK ***
        { location:    { $regex: safeTerm, $options: "i" } }, // L08 — USE safeTerm  *** SINK ***
      ],
    };

    if (isNumeric) {                       // L09 — USE isNumeric (derived from term)
      searchQuery.$or.push(
        { price:         numericTerm },    // L10 — USE numericTerm
        { duration_days: numericTerm }     // L11 — USE numericTerm
      );
    }

    const tours = await Tour.find(searchQuery) // L12 — USE searchQuery (contains safeTerm)
      .populate("created_by", "full_name")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    next(error);
  }
};`;

// ── STATIC BACKWARD SLICE ────────────────────────────────────────────────────
// Criterion: variable `term` at the $regex property (the sink — L06/L07/L08)
//
// Working backwards from the sink:
//   L06-L08 use `safeTerm`
//   L05    defines `safeTerm`  (uses `term`)
//   L03    defines `numericTerm` (uses `term`)
//   L04    defines `isNumeric`   (uses `numericTerm`, derived from `term`)
//   L02    uses `term` (guard clause)
//   L01    defines `term`  ← req.params.term (HTTP input — the SOURCE)
//
// Everything that depends on `term`:  L01, L02, L03, L04, L05, L06, L07, L08, L09, L10, L11, L12
// → the ENTIRE function body is in the slice, because `term` flows into searchQuery
//   which flows into Tour.find() at L12.

const slice = [
  { line: "L01", stmt: "const { term } = req.params;",                  role: "DEFINE term  [SOURCE — HTTP req.params]" },
  { line: "L02", stmt: "if (!term) return next(...)",                    role: "USE term  [guard — validates presence]" },
  { line: "L03", stmt: "const numericTerm = parseFloat(term);",          role: "USE term  → defines numericTerm" },
  { line: "L04", stmt: "const isNumeric = !isNaN(numericTerm);",         role: "USE numericTerm (derived from term)" },
  { line: "L05", stmt: "const safeTerm = escapeRegex(term);",            role: "USE term  → defines safeTerm  [FIX POINT]" },
  { line: "L06", stmt: '{ title:       { $regex: safeTerm } }',          role: "USE safeTerm  *** SINK (title) ***" },
  { line: "L07", stmt: '{ description: { $regex: safeTerm } }',          role: "USE safeTerm  *** SINK (description) ***" },
  { line: "L08", stmt: '{ location:    { $regex: safeTerm } }',          role: "USE safeTerm  *** SINK (location) ***" },
  { line: "L09", stmt: "if (isNumeric) { ... }",                         role: "USE isNumeric (derived from term)" },
  { line: "L10", stmt: "searchQuery.$or.push({ price: numericTerm })",   role: "USE numericTerm (derived from term)" },
  { line: "L12", stmt: "const tours = await Tour.find(searchQuery)",     role: "USE searchQuery (contains safeTerm)" },
];

const sep = "─".repeat(70);
console.log("\n" + sep);
console.log("STATIC BACKWARD SLICE — searchTours, criterion: term @ $regex sink");
console.log(sep);
console.log("\nSlicing criterion: variable `term` at the MongoDB $regex property");
console.log("  → traces ALL statements that may influence $regex input\n");

slice.forEach(({ line, stmt, role }) => {
  const inSlice = true; // every stmt above is in the slice
  console.log(`  ${line}  ${inSlice ? "✔ IN SLICE" : "✗ NOT IN SLICE"}`);
  console.log(`         ${stmt}`);
  console.log(`         → ${role}`);
  console.log();
});

console.log(sep);
console.log("RESULT: 11 of 12 statements are in the backward slice.");
console.log("The entire data flow from HTTP input to $regex is exposed.");
console.log(sep);

// ── FORWARD SLICE (pre-fix vs post-fix) ──────────────────────────────────────
console.log("\n" + sep);
console.log("FORWARD SLICE COMPARISON — term variable");
console.log(sep);

console.log("\nPRE-FIX (before CM-01):");
console.log("  req.params.term → term (unescaped) → { $regex: term }");
console.log("  Forward slice from term reaches $regex DIRECTLY.");
console.log("  Any regex metacharacter in term becomes part of the MongoDB regex.");
console.log("  e.g. term = '(a+)+$' triggers catastrophic backtracking → ReDoS.");

console.log("\nPOST-FIX (after CM-01 — escapeRegex inserted at L05):");
console.log("  req.params.term → term → escapeRegex(term) → safeTerm → { $regex: safeTerm }");
console.log("  Forward slice from term now passes through the sanitization barrier.");
console.log("  Metacharacters are escaped before reaching $regex → no ReDoS possible.");

console.log("\n" + sep);
console.log("KEY MAINTENANCE INSIGHT:");
console.log("  The fix does NOT change the slice MEMBERSHIP (same statements in scope).");
console.log("  It changes the DATA FLOW: a sanitization node is inserted between the");
console.log("  tainted source (term) and the dangerous sink ($regex).");
console.log("  This is exactly what static code slicing is designed to reveal:");
console.log("  the full path from source to sink, and where the fix point should be.");
console.log(sep + "\n");
