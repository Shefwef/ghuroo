// routes/admin.route.js
import express from "express";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import {
  adminTest,
  getUsers,
  getAdmins,
  updateAdmin,
  updateUser,
  deleteUser,
  getDashboardStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/test", adminTest);
router.get("/users", verifyAdmin, getUsers);
router.get("/admins", verifyAdmin, getAdmins);
router.get("/stats", verifyAdmin, getDashboardStats);
router.put("/update/:id",verifyAdmin,updateAdmin);
router.put("/user/:id", verifyAdmin, updateUser);
router.delete("/user/:id", verifyAdmin, deleteUser);

export default router;