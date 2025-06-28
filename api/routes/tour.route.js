// api/routes/tour.route.js
import express from "express";
import { TourModel } from "../models/tour.model.js";

const router = express.Router();

// Get all tours
router.get("/", async (req, res, next) => {
  try {
    const tours = await TourModel.getAll();
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
});

// Get featured tours
router.get("/featured", async (req, res, next) => {
  try {
    const tours = await TourModel.getFeatured();
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
});

// Get tour by ID
router.get("/:id", async (req, res, next) => {
  try {
    const tour = await TourModel.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tour,
    });
  } catch (error) {
    next(error);
  }
});

// Search tours
router.get("/search/:term", async (req, res, next) => {
  try {
    const { term } = req.params;
    const tours = await TourModel.search(term);
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
});

// Get tours by location
router.get("/location/:location", async (req, res, next) => {
  try {
    const { location } = req.params;
    const tours = await TourModel.getByLocation(location);
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
