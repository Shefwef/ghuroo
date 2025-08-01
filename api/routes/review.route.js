import express from "express";
import {
  createReview,
  getReviewsByTour,
  getRecentReviewsByTour,
  getTourAverageRating
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/tour/:tourId", getReviewsByTour);
router.get("/tour/:tourId/recent", getRecentReviewsByTour);
router.get("/tour/:tourId/average", getTourAverageRating);

export default router;