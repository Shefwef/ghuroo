import express from "express";
import {
  createBooking,
  getBookingsByUser,
  getBookingsByTour,
  getAllBookings,
  getRevenues,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { verifyUser } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import { validateBookingInput } from "../utils/validateBooking.js";

const router = express.Router();

// PM-01: every mutating booking route now requires a verified session.
router.post("/", verifyUser, validateBookingInput, createBooking);
router.get("/", verifyAdmin, getAllBookings);
router.get("/revenue", verifyAdmin, getRevenues);
router.get("/user/:userId", verifyUser, getBookingsByUser);
router.get("/tour/:tourId", getBookingsByTour);
router.put("/:id/status", verifyAdmin, updateBookingStatus);
router.delete("/:id", verifyUser, deleteBooking);

export default router;
