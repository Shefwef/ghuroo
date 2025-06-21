import { db } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

export const BookingSchema = {
  id: String,
  user_id: String,
  tour_id: String,
  booking_date: Date,
  status: String,
  total_price: Number,
  created_at: Date,
};

const BOOKING_DEFAULTS = {
  status: "pending",
  created_at: new Date()
};

const VALID_STATUSES = ["pending", "confirmed", "cancelled"];

// Validation functions
export const validateBooking = (bookingData) => {
  const errors = [];
  
  if (!bookingData.user_id || typeof bookingData.user_id !== 'string' || bookingData.user_id.trim() === '') {
    errors.push('user_id is required and must be a valid user ID');
  }
  
  if (!bookingData.tour_id || typeof bookingData.tour_id !== 'string' || bookingData.tour_id.trim() === '') {
    errors.push('tour_id is required and must be a valid tour ID');
  }
  
  if (!bookingData.booking_date || !(bookingData.booking_date instanceof Date)) {
    errors.push('booking_date is required and must be a valid date');
  }
  
  if (!bookingData.total_price || typeof bookingData.total_price !== 'number' || bookingData.total_price <= 0) {
    errors.push('total_price is required and must be a positive number');
  }
  
  if (bookingData.status && !VALID_STATUSES.includes(bookingData.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


export class Booking {
  constructor(bookingData) {
    this.id = bookingData.id || uuidv4();
    this.user_id = bookingData.user_id;
    this.tour_id = bookingData.tour_id;
    this.booking_date = bookingData.booking_date;
    this.status = bookingData.status || BOOKING_DEFAULTS.status;
    this.total_price = bookingData.total_price;
    this.created_at = bookingData.created_at || new Date();
  }

  toFirestore() {
    return {
      id: this.id,
      user_id: this.user_id,
      tour_id: this.tour_id,
      booking_date: this.booking_date,
      status: this.status,
      total_price: this.total_price,
      created_at: this.created_at
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Booking({
      id: doc.id,
      ...data
    });
  }

  validate() {
    return validateBooking(this);
  }

  // Check if booking is active (pending or confirmed)
  isActive() {
    return this.status === 'pending' || this.status === 'confirmed';
  }

  // Check if booking can be cancelled
  canBeCancelled() {
    return this.status === 'pending' || this.status === 'confirmed';
  }
}

// Database operations
export const BookingModel = {
  // Create a new booking
  async create(bookingData) {
    const validation = validateBooking(bookingData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const booking = new Booking(bookingData);
    await db.collection('bookings').doc(booking.id).set(booking.toFirestore());
    return booking;
  },

  // Find booking by ID
  async findById(id) {
    const doc = await db.collection('bookings').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return Booking.fromFirestore(doc);
  },

  // Update booking
  async update(id, updateData) {
    const bookingRef = db.collection('bookings').doc(id);
    const updateObject = {
      ...updateData,
      updated_at: new Date()
    };
    
    await bookingRef.update(updateObject);
    return await this.findById(id);
  },

  // Delete booking
  async delete(id) {
    await db.collection('bookings').doc(id).delete();
    return true;
  },

  // Get all bookings
  async getAll() {
    const snapshot = await db.collection('bookings').get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Get bookings by user
  async getByUser(userId) {
    const snapshot = await db.collection('bookings').where('user_id', '==', userId).get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Get bookings by tour
  async getByTour(tourId) {
    const snapshot = await db.collection('bookings').where('tour_id', '==', tourId).get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Get bookings by status
  async getByStatus(status) {
    const snapshot = await db.collection('bookings').where('status', '==', status).get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Get pending bookings
  async getPending() {
    return await this.getByStatus('pending');
  },

  // Get confirmed bookings
  async getConfirmed() {
    return await this.getByStatus('confirmed');
  },

  // Get cancelled bookings
  async getCancelled() {
    return await this.getByStatus('cancelled');
  },

  // Get user's active bookings (pending or confirmed)
  async getUserActiveBookings(userId) {
    const snapshot = await db.collection('bookings')
      .where('user_id', '==', userId)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Get bookings by date range
  async getByDateRange(startDate, endDate) {
    const snapshot = await db.collection('bookings')
      .where('booking_date', '>=', startDate)
      .where('booking_date', '<=', endDate)
      .get();
    return snapshot.docs.map(doc => Booking.fromFirestore(doc));
  },

  // Confirm a booking
  async confirm(id) {
    return await this.update(id, { status: 'confirmed' });
  },

  // Cancel a booking
  async cancel(id) {
    return await this.update(id, { status: 'cancelled' });
  },

  // Check if user has existing booking for tour
  async hasUserBookedTour(userId, tourId) {
    const snapshot = await db.collection('bookings')
      .where('user_id', '==', userId)
      .where('tour_id', '==', tourId)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();
    return !snapshot.empty;
  },

  // Get booking count for a tour
  async getTourBookingCount(tourId) {
    const snapshot = await db.collection('bookings')
      .where('tour_id', '==', tourId)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();
    return snapshot.size;
  },

  // Get total revenue from confirmed bookings
  async getTotalRevenue() {
    const snapshot = await db.collection('bookings')
      .where('status', '==', 'confirmed')
      .get();
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const booking = Booking.fromFirestore(doc);
      total += booking.total_price;
    });
    
    return total;
  }
};