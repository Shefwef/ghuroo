import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import Notification from "../models/notification.model.js";
import { parsePagination, paginationEnvelope } from "../utils/paginate.js";

export const createBooking = async (req, res) => {
  console.log("Booking request body:", req.body);
  try {
    const {
      tour_id,
      booking_date,
      total_price,
      number_of_persons,
    } = req.body;

    // PM-01: use the identity from the verified JWT, not the request body,
    // so a user cannot create bookings on behalf of another user.
    const user_id = req.user.id;

    const booking = new Booking({
      user_id,
      tour_id,
      booking_date,
      total_price: Number(total_price),
      number_of_persons: Number(number_of_persons),
      status: "pending",
    });

    await booking.save();

    
    const [tour, user] = await Promise.all([
      Tour.findById(tour_id),
      User.findById(user_id),
    ]);

    
    const admins = await User.find({ role: "admin" });

    
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

    // PM-01: a user may only read their own bookings; admins may read any user's.
    if (req.user.id !== userId && !req.user.admin) {
      return res.status(403).json({ success: false, message: "Not authorised to view these bookings" });
    }

    const bookings = await Booking.find({ user_id: userId }).populate("tour_id");
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
    // PFM-01: paginate to avoid loading the full bookings collection on every admin page load.
    const { page, limit, skip } = parsePagination(req);
    const [bookings, total] = await Promise.all([
      Booking.find()
        .populate("tour_id", "title")
        .populate("user_id", "full_name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(),
    ]);
    res.json(paginationEnvelope({ data: bookings, total, page, limit }));
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

    
    const previousBooking = await Booking.findById(id);

    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    
    const [tour, user] = await Promise.all([
      Tour.findById(booking.tour_id),
      User.findById(booking.user_id),
    ]);

    
    const admins = await User.find({ role: "admin" });

    
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

    // PM-01: only the booking owner or an admin may cancel a booking.
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.user_id.toString() !== req.user.id && !req.user.admin) {
      return res.status(403).json({ success: false, message: "Not authorised to delete this booking" });
    }

    await booking.deleteOne();
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
