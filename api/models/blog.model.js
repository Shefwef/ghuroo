import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    is_featured: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);