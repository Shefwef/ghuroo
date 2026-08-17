/**
 * Standalone, DB-free reproduction of PM-01 booking authorization hardening.
 *
 * Spins up two minimal Express servers:
 *   Server A (port 5101) — pre-PM-01: no auth, trusts req.body.user_id
 *   Server B (port 5102) — post-PM-01: verifyUser + validateBookingInput
 *
 * Makes real HTTP POST requests with crafted bodies against both to show:
 *   1. Impersonation: before, any caller can book as ANY user_id.
 *      After, user_id is taken from the JWT; body value ignored.
 *   2. Input validation: before, 0 persons / negative price / past date accepted.
 *      After, all are rejected with descriptive 400 errors.
 *   3. Unauthenticated access: before, no cookie needed. After, 401.
 *
 * Run: node maintenance/appendix/preventive/repro-booking-auth.mjs
 */

import express from "express";
import http from "http";

// ── helpers ────────────────────────────────────────────────────────────────

function post(port, body, cookie = "") {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = {
      host: "127.0.0.1", port,
      path: "/api/bookings", method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function label(text) {
  console.log(`\n${"─".repeat(60)}\n${text}\n${"─".repeat(60)}`);
}

// ── Server A — PRE-PM-01 (no auth, body user_id trusted) ──────────────────

function startOldServer(port) {
  const app = express();
  app.use(express.json());

  // Original booking.controller.js::createBooking — simplified, no DB
  app.post("/api/bookings", (req, res) => {
    const { user_id, tour_id, booking_date, total_price, number_of_persons, status } = req.body;

    // Only check for presence of fields (original code)
    if (!user_id || !tour_id || !booking_date || !total_price || !number_of_persons) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // No auth. No range validation. No date check.
    res.status(201).json({
      success: true,
      data: { user_id, tour_id, booking_date, total_price, number_of_persons, status: status || "pending" },
    });
  });

  return app.listen(port);
}

// ── Server B — POST-PM-01 (verifyUser + validateBookingInput) ─────────────

// Mock JWT decode: a valid token encodes user id "user-alice-001"
const VALID_TOKEN = "mock-jwt-alice";
const ALICE_ID = "user-alice-001";

function mockVerifyUser(req, res, next) {
  const cookie = req.headers.cookie || "";
  const token = cookie.replace("access_token=", "").trim();
  if (token !== VALID_TOKEN) {
    return res.status(401).json({ success: false, message: "Not authenticated!" });
  }
  req.user = { id: ALICE_ID, admin: false };
  next();
}

function validateBookingInput(req, res, next) {
  const { tour_id, booking_date, total_price, number_of_persons } = req.body;
  if (!tour_id) return res.status(400).json({ success: false, message: "tour_id is required" });

  const persons = Number(number_of_persons);
  if (!Number.isInteger(persons) || persons < 1 || persons > 50)
    return res.status(400).json({ success: false, message: "number_of_persons must be a whole number between 1 and 50" });

  const price = Number(total_price);
  if (!isFinite(price) || price < 0.01)
    return res.status(400).json({ success: false, message: "total_price must be a positive number" });

  const date = new Date(booking_date);
  if (isNaN(date.getTime()))
    return res.status(400).json({ success: false, message: "booking_date must be a valid date" });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (date < today)
    return res.status(400).json({ success: false, message: "booking_date must not be in the past" });

  next();
}

function startNewServer(port) {
  const app = express();
  app.use(express.json());

  // Fixed booking controller — user_id from JWT, not body
  app.post("/api/bookings", mockVerifyUser, validateBookingInput, (req, res) => {
    const { tour_id, booking_date, total_price, number_of_persons } = req.body;
    const user_id = req.user.id; // from verified JWT, ignores body

    res.status(201).json({
      success: true,
      data: { user_id, tour_id, booking_date, total_price: Number(total_price), number_of_persons: Number(number_of_persons), status: "pending" },
    });
  });

  return app.listen(port);
}

// ── Test cases ─────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0];
const PAST_DATE   = "2020-01-01";

const VICTIM_USER_ID  = "user-bob-999";  // a different user Alice is trying to impersonate
const VALID_BODY = { tour_id: "tour-xyz", booking_date: FUTURE_DATE, total_price: 1500, number_of_persons: 2 };

async function main() {
  const oldServer = startOldServer(5101);
  const newServer = startNewServer(5102);

  // ── 1. Impersonation attack ──────────────────────────────────────────────
  label("TEST 1 — Impersonation: booking with another user's ID in body");

  const r1old = await post(5101, { ...VALID_BODY, user_id: VICTIM_USER_ID });
  console.log(`  [BEFORE PM-01] status=${r1old.status} booked_as=${r1old.body.data?.user_id}`);
  //  → accepts VICTIM's id; Alice creates a booking attributed to Bob

  // With valid auth cookie, body user_id is silently ignored
  const r1new = await post(5102, { ...VALID_BODY, user_id: VICTIM_USER_ID }, `access_token=${VALID_TOKEN}`);
  console.log(`  [AFTER  PM-01] status=${r1new.status} booked_as=${r1new.body.data?.user_id}`);
  //  → booking attributed to Alice (from JWT), Bob's id in body is discarded

  // ── 2. Unauthenticated access ─────────────────────────────────────────────
  label("TEST 2 — Unauthenticated access: no cookie sent");

  const r2old = await post(5101, { ...VALID_BODY, user_id: "anyone" });
  console.log(`  [BEFORE PM-01] status=${r2old.status} → accepted (no auth check)`);

  const r2new = await post(5102, { ...VALID_BODY, user_id: "anyone" }); // no cookie
  console.log(`  [AFTER  PM-01] status=${r2new.status} message="${r2new.body.message}"`);

  // ── 3. Invalid persons count ────────────────────────────────────────────
  // number_of_persons = -1: the old code checks `if (!number_of_persons)` which
  // treats -1 as truthy, so -1 passes validation and enters the DB. The new
  // middleware catches it with an integer range check.
  label("TEST 3 — Input validation: number_of_persons = -1 (truthy, so old check misses it)");

  const r3old = await post(5101, { ...VALID_BODY, user_id: "u1", number_of_persons: -1 });
  console.log(`  [BEFORE PM-01] status=${r3old.status} → ${r3old.body.success ? "accepted (-1 persons stored in DB)" : "rejected"}`);

  const r3new = await post(5102, { ...VALID_BODY, number_of_persons: -1 }, `access_token=${VALID_TOKEN}`);
  console.log(`  [AFTER  PM-01] status=${r3new.status} message="${r3new.body.message}"`);

  // ── 4. Negative price ─────────────────────────────────────────────────────
  label("TEST 4 — Input validation: total_price = -500");

  const r4old = await post(5101, { ...VALID_BODY, user_id: "u1", total_price: -500 });
  console.log(`  [BEFORE PM-01] status=${r4old.status} → ${r4old.body.success ? "accepted (negative price in DB)" : "rejected"}`);

  const r4new = await post(5102, { ...VALID_BODY, total_price: -500 }, `access_token=${VALID_TOKEN}`);
  console.log(`  [AFTER  PM-01] status=${r4new.status} message="${r4new.body.message}"`);

  // ── 5. Past booking date ──────────────────────────────────────────────────
  label("TEST 5 — Input validation: booking_date in the past");

  const r5old = await post(5101, { ...VALID_BODY, user_id: "u1", booking_date: PAST_DATE });
  console.log(`  [BEFORE PM-01] status=${r5old.status} → ${r5old.body.success ? "accepted (past date in DB)" : "rejected"}`);

  const r5new = await post(5102, { ...VALID_BODY, booking_date: PAST_DATE }, `access_token=${VALID_TOKEN}`);
  console.log(`  [AFTER  PM-01] status=${r5new.status} message="${r5new.body.message}"`);

  // ── 6. Happy path (valid request) ─────────────────────────────────────────
  label("TEST 6 — Happy path: valid booking with auth cookie");

  const r6old = await post(5101, { ...VALID_BODY, user_id: ALICE_ID });
  console.log(`  [BEFORE PM-01] status=${r6old.status} booked_as=${r6old.body.data?.user_id}`);

  const r6new = await post(5102, VALID_BODY, `access_token=${VALID_TOKEN}`);
  console.log(`  [AFTER  PM-01] status=${r6new.status} booked_as=${r6new.body.data?.user_id}`);

  console.log("\n");
  oldServer.close();
  newServer.close();
}

main().catch(console.error);
