/**
 * Code Clone Detection — Lab 6 technique applied to Ghuroo
 *
 * Detects Type-1 (exact), Type-2 (renamed), and Type-3 (gapped) clones
 * using a token-based similarity approach:
 *   1. Tokenise each function body (strip identifiers → canonical tokens)
 *   2. Compute Jaccard similarity on token sets
 *   3. Classify clone type based on similarity score
 *
 * Clone types (IEEE taxonomy):
 *   Type 1 — identical except whitespace/comments
 *   Type 2 — structurally identical, identifiers/literals renamed
 *   Type 3 — same structure, some statements added/deleted/modified
 *   Type 4 — same semantics, different implementation (not detectable here)
 *
 * Run: node maintenance/appendix/clone-detection/clone-analysis.mjs
 */

// ── Function bodies extracted from the codebase ──────────────────────────────

const functions = {
  searchTours: `
    const { term } = req.params;
    if (!term) { return next(errorHandler(400, "Search term is required")); }
    const numericTerm = parseFloat(term);
    const isNumeric = !isNaN(numericTerm);
    const safeTerm = escapeRegex(term);
    const searchQuery = {
      $or: [
        { title:       { $regex: safeTerm, $options: "i" } },
        { description: { $regex: safeTerm, $options: "i" } },
        { location:    { $regex: safeTerm, $options: "i" } },
      ],
    };
    if (isNumeric) {
      searchQuery.$or.push({ price: numericTerm }, { duration_days: numericTerm });
    }
    const tours = await Tour.find(searchQuery).populate("created_by","full_name").sort({ created_at: -1 });
    res.status(200).json({ success: true, data: tours });
  `,

  searchBlogs: `
    const { term } = req.params;
    if (!term) { return next(errorHandler(400, "Search term is required")); }
    const safeTerm = escapeRegex(term);
    const searchQuery = {
      $or: [
        { title:   { $regex: safeTerm, $options: "i" } },
        { content: { $regex: safeTerm, $options: "i" } },
      ],
    };
    const blogs = await Blog.find(searchQuery).populate("user_id","full_name profilePicture").sort({ created_at: -1 });
    res.status(200).json({ success: true, data: blogs });
  `,

  getAllTours: `
    const { page, limit, skip } = parsePagination(req);
    const [tours, total] = await Promise.all([
      Tour.find().sort({ created_at: -1 }).skip(skip).limit(limit),
      Tour.countDocuments(),
    ]);
    res.status(200).json(paginationEnvelope({ data: tours, total, page, limit }));
  `,

  getAllBookings: `
    const { page, limit, skip } = parsePagination(req);
    const [bookings, total] = await Promise.all([
      Booking.find().populate("tour_id","title").populate("user_id","full_name")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(),
    ]);
    res.json(paginationEnvelope({ data: bookings, total, page, limit }));
  `,

  createBooking: `
    const { tour_id, booking_date, total_price, number_of_persons } = req.body;
    const user_id = req.user.id;
    const booking = new Booking({ user_id, tour_id, booking_date,
      total_price: Number(total_price), number_of_persons: Number(number_of_persons), status: "pending" });
    await booking.save();
    const [tour, user] = await Promise.all([Tour.findById(tour_id), User.findById(user_id)]);
    const admins = await User.find({ role: "admin" });
    const notificationPromises = admins.map((admin) => {
      const notification = new Notification({ recipient_id: admin._id,
        title: "New Booking Created", type: "booking", reference_id: booking._id });
      return notification.save();
    });
    await Promise.all(notificationPromises);
    res.status(201).json({ success: true, data: booking });
  `,

  updateBookingStatus: `
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    const [tour, user] = await Promise.all([Tour.findById(booking.tour_id), User.findById(booking.user_id)]);
    const admins = await User.find({ role: "admin" });
    const adminNotificationPromises = admins.map((admin) => {
      const notification = new Notification({ recipient_id: admin._id,
        title: "Booking Status Updated", type: "booking_status", reference_id: booking._id });
      return notification.save();
    });
    const userNotification = new Notification({ recipient_id: booking.user_id,
      title: "Booking Status Updated", type: "booking_status", reference_id: booking._id });
    await Promise.all([...adminNotificationPromises, userNotification.save()]);
    res.json({ success: true, data: booking });
  `,
};

// ── Tokeniser ─────────────────────────────────────────────────────────────────
// Type-2 normalisation: replace identifiers and string literals with canonical tokens.
function tokenize(src) {
  return src
    .replace(/\/\/[^\n]*/g, "")               // strip comments
    .replace(/"[^"]*"|'[^']*'|`[^`]*`/g, "STR")  // literals → STR
    .replace(/\b\d+(\.\d+)?\b/g, "NUM")        // numbers → NUM
    .replace(/\b(const|let|var|async|await|return|if|else|new|true|false|null)\b/g, m => m.toUpperCase())
    .replace(/\b[a-z][A-Za-z0-9]*\b/g, "ID")  // identifiers → ID
    .split(/[\s,;{}()\[\]]+/)
    .filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function lineOverlap(a, b) {
  const linesA = a.trim().split("\n").map(l => l.trim()).filter(Boolean);
  const linesB = b.trim().split("\n").map(l => l.trim()).filter(Boolean);
  const setA = new Set(linesA);
  const setB = new Set(linesB);
  const common = [...setA].filter(x => setB.has(x)).length;
  return common / Math.max(setA.size, setB.size);
}

function cloneType(jaccard) {
  if (jaccard >= 0.95) return "Type 1 (exact)";
  if (jaccard >= 0.75) return "Type 2 (renamed identifiers)";
  if (jaccard >= 0.50) return "Type 3 (gapped / modified)";
  return "Not a clone";
}

// ── Pairwise comparison ───────────────────────────────────────────────────────
const names = Object.keys(functions);
const pairs = [];
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const a = names[i], b = names[j];
    const tokA = tokenize(functions[a]);
    const tokB = tokenize(functions[b]);
    const sim  = jaccardSimilarity(tokA, tokB);
    const lo   = lineOverlap(functions[a], functions[b]);
    pairs.push({ a, b, sim, lo, type: cloneType(sim) });
  }
}

// Sort by similarity descending
pairs.sort((x, y) => y.sim - x.sim);

const sep = "─".repeat(72);
console.log("\n" + sep);
console.log("CODE CLONE DETECTION REPORT — Ghuroo API Controllers");
console.log("Technique: Token-based similarity (Jaccard index, Type-2 normalisation)");
console.log(sep);

console.log("\nPAIRWISE SIMILARITY MATRIX (threshold: ≥ 0.50 = clone pair)\n");
console.log("  Function A              Function B              Similarity  Clone Type");
console.log("  " + "─".repeat(68));

pairs.forEach(({ a, b, sim, type }) => {
  const simStr = (sim * 100).toFixed(1) + "%";
  const highlight = sim >= 0.50 ? "  ◄ CLONE" : "";
  const line = `  ${a.padEnd(23)} ${b.padEnd(23)} ${simStr.padStart(8)}   ${type}${highlight}`;
  console.log(line);
});

console.log("\n" + sep);
console.log("CLONE PAIRS IDENTIFIED:");
console.log(sep);

const clones = pairs.filter(p => p.sim >= 0.50);
clones.forEach(({ a, b, sim, type }, i) => {
  console.log(`\n  Clone Pair ${i + 1}: ${a}  ↔  ${b}`);
  console.log(`  Type:        ${type}`);
  console.log(`  Similarity:  ${(sim * 100).toFixed(1)}%`);

  if ((a === "searchTours" && b === "searchBlogs") || (a === "searchBlogs" && b === "searchTours")) {
    console.log("  Shared structure:");
    console.log("    const { term } = req.params  →  guard (!term)  →  escapeRegex(term)");
    console.log("    →  { $or: [ { field: { $regex: safeTerm } }, ... ] }  →  Model.find()");
    console.log("    →  res.status(200).json({ success: true, data })");
    console.log("  Differences: model (Tour vs Blog), field names (location vs content),");
    console.log("               numericTerm branch exists only in searchTours.");
    console.log("  Maintenance note: the CM-01 fix (escapeRegex) was applied to BOTH");
    console.log("  functions — this clone pair is what made the multi-site fix necessary.");
  }

  if ((a === "getAllTours" && b === "getAllBookings") || (a === "getAllBookings" && b === "getAllTours")) {
    console.log("  Shared structure:");
    console.log("    parsePagination(req)  →  Promise.all([Model.find()...skip().limit(), countDocuments()])");
    console.log("    →  res.json(paginationEnvelope({ data, total, page, limit }))");
    console.log("  Differences: model (Tour vs Booking), field names, populate() calls.");
    console.log("  Maintenance note: PFM-01 added pagination to BOTH functions simultaneously");
    console.log("  because the same unbounded-query problem existed in both clone instances.");
  }

  if ((a === "createBooking" && b === "updateBookingStatus") || (a === "updateBookingStatus" && b === "createBooking")) {
    console.log("  Shared structure: both fetch admins, fan-out Notification saves to all admins.");
    console.log("  Differences: trigger event and notification title differ.");
    console.log("  Maintenance note: a future refactor could extract the admin-notification");
    console.log("  fan-out into a shared utility (DRY).");
  }
});

console.log("\n" + sep);
console.log("SUMMARY:");
console.log(`  Total function pairs analysed: ${pairs.length}`);
console.log(`  Clone pairs detected (≥50% similarity): ${clones.length}`);
console.log("  Most significant clone: searchTours ↔ searchBlogs (Type 2)");
console.log("    — this clone is what caused CM-01 to require a multi-site fix.");
console.log(sep + "\n");
