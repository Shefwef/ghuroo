import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import Notification from "../models/notification.model.js";

export const createReview = async (req, res) => {
  try {
    const { user_id, tour_id, rating, comment } = req.body;
    if (!user_id || !tour_id || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    // Prevent duplicate review per user per tour
    const existing = await Review.findOne({ user_id, tour_id });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already reviewed this tour.",
        });
    }
    const review = await Review.create({ user_id, tour_id, rating, comment });

    // Get tour and user details for the notification
    const [tour, user] = await Promise.all([
      Tour.findById(tour_id),
      User.findById(user_id),
    ]);

    // Create notification for admins
    const admins = await User.find({ role: "admin" });

    // Create a notification for each admin
    const notificationPromises = admins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "New Review Submitted",
        message: `${user.full_name} has submitted a ${rating}-star review for ${tour.title}.`,
        type: "review",
        reference_id: review._id,
        reference_model: "Review",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviewsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour_id: tourId })
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentReviewsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour_id: tourId })
      .populate("user_id", "full_name profilePicture")
      .sort({ created_at: -1 })
      .limit(5);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTourAverageRating = async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour_id: tourId });
    if (!reviews.length) return res.json({ success: true, average: 0 });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    res.json({ success: true, average: Math.round(avg * 10) / 10 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user_id", "full_name email")
      .populate("tour_id", "title")
      .sort({ created_at: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
