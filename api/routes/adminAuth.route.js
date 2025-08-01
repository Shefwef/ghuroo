// routes/adminAuth.route.js
import express from "express";
import { adminSignup, adminSignin, adminSignout } from "../controllers/adminAuth.controller.js";
const router = express.Router();

router.post("/signup", adminSignup);
router.post("/signin", adminSignin);
router.get("/signout", adminSignout);

export default router;