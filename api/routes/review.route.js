import express from "express";
import { verifyAdmin } from '../utils/verifyAdmin.js';
import {
  createReview,
  getReviewsByTour,
  getRecentReviewsByTour,
  getTourAverageRating,
  getAllReviews,
  deleteReview
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/",getAllReviews);
router.delete("/:id", verifyAdmin, deleteReview);
router.get("/tour/:tourId", getReviewsByTour);
router.get("/tour/:tourId/recent", getRecentReviewsByTour);
router.get("/tour/:tourId/average", getTourAverageRating);

export default router;