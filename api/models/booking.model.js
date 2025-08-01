import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    tour_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Tour", 
      required: true 
    },
    booking_date: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String,
      enum: ["pending", "confirmed", "cancelled"], 
      default: "pending" 
    },
    total_price: { 
      type: Number, 
      required: true 
    },
    number_of_persons: { 
      type: Number, 
      required: true 
    },
    created_at: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model("Booking", bookingSchema);