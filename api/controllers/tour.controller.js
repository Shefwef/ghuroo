import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";
import { supabaseStorage, uploadToSupabase } from "../utils/supabaseStorage.js";

export const upload = supabaseStorage;

export const createTour = async (req, res, next) => {
  try {
    console.log("=== createTour START ===");
    console.log("req.body:", JSON.stringify(req.body, null, 2));
    console.log("req.files:", req.files);
    console.log("req.user:", req.user);

    const tourData = {
      ...req.body,
      created_by: req.user.id, 
      price: Number(req.body.price),
      duration_days: Number(req.body.duration_days),
      is_featured:
        req.body.is_featured === "true" || req.body.is_featured === true,
    };

    
    if (req.files) {
      console.log("Files detected:", Object.keys(req.files));

      if (req.files.thumbnail) {
        console.log("Uploading thumbnail to Supabase...");
        const thumbnailResult = await uploadToSupabase(
          req.files.thumbnail[0],
          "tours"
        );
        tourData.thumbnail_url = thumbnailResult.publicUrl;
        console.log("Thumbnail uploaded:", tourData.thumbnail_url);
      }

      if (req.files.gallery) {
        console.log("Uploading gallery images to Supabase...");
        const galleryPromises = req.files.gallery.map((file) =>
          uploadToSupabase(file, "tours")
        );
        const galleryResults = await Promise.all(galleryPromises);
        tourData.gallery_urls = galleryResults.map(
          (result) => result.publicUrl
        );
        console.log("Gallery uploaded:", tourData.gallery_urls);
      }
    } else {
      console.log("No files uploaded");
    }

    console.log("Final tourData:", JSON.stringify(tourData, null, 2));

    
    const newTour = new Tour(tourData);
    const savedTour = await newTour.save();

    
    const admin = await User.findById(req.user.id);

    
    const otherAdmins = await User.find({
      role: "admin",
      _id: { $ne: req.user.id }, 
    });

    
    const notificationPromises = otherAdmins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "New Tour Created",
        message: `${admin.full_name} has created a new tour: ${savedTour.title}.`,
        type: "tour_creation",
        reference_id: savedTour._id,
        reference_model: "Tour",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    console.log("Tour created successfully:", savedTour);
    res.status(201).json({ success: true, data: savedTour });
  } catch (error) {
    console.error("createTour error:", error);
    next(error);
  }
};

export const getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.find().sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

export const getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).populate(
      "created_by",
      "full_name"
    );

    if (!tour) return next(errorHandler(404, "Tour not found"));

    res.status(200).json({
      success: true,
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return next(errorHandler(404, "Tour not found"));

    if (tour.created_by.toString() !== req.user.id && !req.user.admin) {
      return next(errorHandler(403, "You can only update your own tours"));
    }

    const updateData = req.body;

    if (req.files && req.files["thumbnail"]) {
      const thumbnailResult = await uploadToSupabase(
        req.files["thumbnail"][0],
        "tours"
      );
      updateData.thumbnail_url = thumbnailResult.publicUrl;
    }

    if (req.files && req.files["gallery"]) {
      const galleryPromises = req.files["gallery"].map((file) =>
        uploadToSupabase(file, "tours")
      );
      const galleryResults = await Promise.all(galleryPromises);
      updateData.gallery_urls = galleryResults.map(
        (result) => result.publicUrl
      );
    }

    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.duration_days) {
      updateData.duration_days = Number(updateData.duration_days);
    }

    if (updateData.is_featured !== undefined) {
      updateData.is_featured =
        updateData.is_featured === "true" || updateData.is_featured === true;
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTour,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return next(errorHandler(404, "Tour not found"));

    if (!req.user.admin) {
      return next(errorHandler(403, "Only admin can delete tours"));
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchTours = async (req, res, next) => {
  try {
    const { term } = req.params;

    if (!term) {
      return next(errorHandler(400, "Search term is required"));
    }

    const numericTerm = parseFloat(term);
    const isNumeric = !isNaN(numericTerm);

    const searchQuery = {
      $or: [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ],
    };

    if (isNumeric) {
      searchQuery.$or.push(
        { price: numericTerm },
        { duration_days: numericTerm }
      );
    }

    const tours = await Tour.find(searchQuery)
      .populate("created_by", "full_name")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedTours = async (req, res, next) => {
  try {
    const tours = await Tour.find({ is_featured: true })
      .populate("created_by", "full_name")
      .sort({ created_at: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

export const getToursByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;

    if (!location) {
      return next(errorHandler(400, "Location is required"));
    }

    const tours = await Tour.find({
      location: { $regex: `^${location}$`, $options: "i" }, 
    })
      .populate("created_by", "full_name")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};
