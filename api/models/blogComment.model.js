import mongoose from "mongoose";

const blogCommentSchema = new mongoose.Schema(
  {
    blog_id: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("BlogComment", blogCommentSchema);