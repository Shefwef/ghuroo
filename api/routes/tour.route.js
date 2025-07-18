// api/routes/tour.route.js
import express from "express";
import { TourModel } from "../models/tour.model.js";
import multer from "multer";
import cloudinary, { storage } from "../utils/cloudinary.js";

const router = express.Router();

const upload = multer({ storage });

// Create a new tour
router.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res, next) => {
    try {
      const tourData = req.body;
      // Get Cloudinary URLs
      if (req.files["thumbnail"]) {
        tourData.thumbnail_url = req.files["thumbnail"][0].path;
      }
      if (req.files["gallery"]) {
        tourData.gallery_urls = req.files["gallery"].map((file) => file.path);
      }
      tourData.price = Number(tourData.price);
tourData.duration_days = Number(tourData.duration_days);
tourData.is_featured = tourData.is_featured === "true" || tourData.is_featured === true;
      const newTour = await TourModel.create(tourData);
      res.status(201).json({
        success: true,
        data: newTour,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);


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
