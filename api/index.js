import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import tourRoutes from "./routes/tour.route.js";
import bookingRoutes from "./routes/booking.route.js";
import blogRoutes from "./routes/blog.route.js";
import blogCommentRoutes from "./routes/blogComment.route.js";
import adminRoutes from "./routes/admin.route.js";
import adminAuthRoutes from "./routes/adminAuth.route.js";
import reviewRoutes from "./routes/review.route.js";
import notificationRoutes from "./routes/notification.route.js";
import uploadRoutes from "./routes/upload.route.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import path from "path";

// Handle __dirname in ES module scope and configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config(); // Load from current directory (api/.env)

const app = express();

const clientDistPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDistPath));

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(express.static(join(__dirname, "client", "dist")));

// API routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-comments", blogCommentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);


app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message} (Status: ${statusCode})`);
  res.status(statusCode).json({
    success: false,
    message,
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

connectDB();
