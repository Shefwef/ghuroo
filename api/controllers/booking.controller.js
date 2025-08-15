import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import Notification from "../models/notification.model.js";

export const createBooking = async (req, res) => {
  console.log("Booking request body:", req.body);
  try {
    const {
      user_id,
      tour_id,
      booking_date,
      total_price,
      number_of_persons,
      status,
    } = req.body;

    if (
      !user_id ||
      !tour_id ||
      !booking_date ||
      !total_price ||
      !number_of_persons
    ) {
      console.log("Missing required fields");
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const booking = new Booking({
      user_id,
      tour_id,
      booking_date,
      total_price,
      number_of_persons,
      status: status || "pending",
    });

    await booking.save();

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
        title: "New Booking Created",
        message: `${user.full_name} has booked ${
          tour.title
        } for ${number_of_persons} person(s) on ${new Date(
          booking_date
        ).toLocaleDateString()}.`,
        type: "booking",
        reference_id: booking._id,
        reference_model: "Booking",
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    console.log("Booking created:", booking);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ user_id: userId }).populate(
      "tour_id"
    );
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings by user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const bookings = await Booking.find({ tour_id: tourId }).populate(
      "user_id"
    );
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings by tour error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("tour_id", "title")
      .populate("user_id", "full_name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenues = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_price" },
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      totalRevenue,
    });
  } catch (err) {
    console.error("Error calculating revenue:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate revenue",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the booking before updating to get the previous status
    const previousBooking = await Booking.findById(id);

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // Get tour and user details for the notification
    const [tour, user] = await Promise.all([
      Tour.findById(booking.tour_id),
      User.findById(booking.user_id),
    ]);

    // Create notification for admins about the status change
    const admins = await User.find({ role: "admin" });

    // Create a notification for each admin
    const adminNotificationPromises = admins.map((admin) => {
      const notification = new Notification({
        recipient_id: admin._id,
        title: "Booking Status Updated",
        message: `Booking for ${tour.title} by ${user.full_name} has been ${status}.`,
        type: "booking_status",
        reference_id: booking._id,
        reference_model: "Booking",
      });
      return notification.save();
    });

    // Also create a notification for the user
    const userNotification = new Notification({
      recipient_id: booking.user_id,
      title: "Booking Status Updated",
      message: `Your booking for ${tour.title} has been ${status}.`,
      type: "booking_status",
      reference_id: booking._id,
      reference_model: "Booking",
    });

    await Promise.all([...adminNotificationPromises, userNotification.save()]);

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
