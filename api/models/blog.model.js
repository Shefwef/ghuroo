import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail_url: { type: String }, // Add thumbnail URL field
    gallery_urls: [{ type: String }], // Add gallery URLs array field
    is_featured: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);