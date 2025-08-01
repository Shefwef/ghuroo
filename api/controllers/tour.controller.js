import Tour from '../models/tour.model.js';
import { errorHandler } from '../utils/error.js';
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

export const upload = multer({ storage });



export const createTour = async (req, res, next) => {
    try {
    const tourData = {
      ...req.body,
      created_by: req.user.id, // Using req.user.id from verifyAdmin middleware
      price: Number(req.body.price),
      duration_days: Number(req.body.duration_days),
      is_featured: req.body.is_featured === "true" || req.body.is_featured === true
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.thumbnail) {
        tourData.thumbnail_url = req.files.thumbnail[0].path;
      }
      if (req.files.gallery) {
        tourData.gallery_urls = req.files.gallery.map(file => file.path);
      }
    }

    const newTour = await Tour.create(tourData);
    
    res.status(201).json({
      success: true,
      data: newTour
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.find()
      .sort({ created_at: -1 });

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
    const tour = await Tour.findById(req.params.id)
      .populate('created_by', 'full_name');
    
      if (!tour) return next(errorHandler(404, 'Tour not found'));
    
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
    if (!tour) return next(errorHandler(404, 'Tour not found'));

    if (tour.created_by.toString() !== req.user.id && !req.user.admin) {
      return next(errorHandler(403, 'You can only update your own tours'));
    }

    const updateData = req.body;
    
    if (req.files && req.files['thumbnail']) {
      updateData.thumbnail_url = req.files['thumbnail'][0].path;
    }
    
    if (req.files && req.files['gallery']) {
      updateData.gallery_urls = req.files['gallery'].map((file) => file.path);
    }
    
    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }
    
    if (updateData.duration_days) {
      updateData.duration_days = Number(updateData.duration_days);
    }
    
    if (updateData.is_featured !== undefined) {
      updateData.is_featured = updateData.is_featured === "true" || updateData.is_featured === true;
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
    if (!tour) return next(errorHandler(404, 'Tour not found'));

    if (!req.user.admin) {
      return next(errorHandler(403, 'Only admin can delete tours'));
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const searchTours = async (req, res, next) => {
  try {
    const { term } = req.params;
    
    if (!term) {
      return next(errorHandler(400, 'Search term is required'));
    }
    
    const numericTerm = parseFloat(term);
    const isNumeric = !isNaN(numericTerm);
    
    const searchQuery = {
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ]
    };

    if (isNumeric) {
      searchQuery.$or.push(
        { price: numericTerm },
        { duration_days: numericTerm }
      );
    }
    
    const tours = await Tour.find(searchQuery)
      .populate('created_by', 'full_name')
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
      .populate('created_by', 'full_name')
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


