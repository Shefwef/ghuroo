import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking",
        "review",
        "user",
        "blog",
        "system",
        "blog_comment",
        "tour_creation",
        "booking_status",
        "profile_update",
      ],
      default: "system",
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "reference_model",
    },
    reference_model: {
      type: String,
      enum: ["Booking", "Review", "User", "Blog", "BlogComment", "Tour"],
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
