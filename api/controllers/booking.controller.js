import Booking from "../models/booking.model.js";

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

    if (!user_id || !tour_id || !booking_date || !total_price || !number_of_persons) {
      console.log("Missing required fields");
      return res.status(400).json({ success: false, message: "Missing required fields" });
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
    const bookings = await Booking.find({ tour_id: tourId }).populate("user_id");
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings by tour error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user_id tour_id");
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
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