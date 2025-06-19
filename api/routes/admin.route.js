// routes/admin.route.js
import express from "express";
import { adminTest, getUsers, deleteUserAsAdmin } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";
const router = express.Router();

router.get("/test", adminTest);
router.get("/users", verifyAdmin, getUsers);
router.delete("/users/:userId", verifyAdmin, deleteUserAsAdmin);

export default router;