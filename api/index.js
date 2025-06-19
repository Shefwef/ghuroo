import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import Firebase Admin (via firebase.js)
import "./firebase.js"; // this initializes Firebase

// Load environment variables
dotenv.config();

const app = express();

// Handle __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(join(__dirname, "client", "dist")));

// API routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

// Catch-all route for client SPA
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "client", "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message} (Status: ${statusCode})`);
  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
