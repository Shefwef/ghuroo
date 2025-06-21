// controllers/adminAuth.controller.js
import { auth, db } from "../firebase.js";
import { UserModel } from "../models/user.model.js";
import admin from "../firebase.js";

export const adminSignup = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // First create Firebase auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    // Set custom claim to mark as admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    // Store additional admin data in Firestore
    await UserModel.create({
      id: userRecord.uid,
      full_name: username,
      email: email,
      role: "admin"
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    next(err);
  }
};

export const adminSignin = async (req, res, next) => {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ 
        success: false,
        message: "ID token is required" 
      });
    }
  
    try {
      const decoded = await auth.verifyIdToken(idToken);
      
      if (!decoded.admin) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized as admin" 
        });
      }
  
      const userRecord = await auth.getUser(decoded.uid);
      const admin = await UserModel.findById(decoded.uid);
      
      if (!admin || admin.role !== 'admin') {
        return res.status(404).json({ 
          success: false,
          message: "Admin record not found" 
        });
      }
  
  
      res
        .cookie("admin_token", idToken, { 
          httpOnly: true, 
          expires: new Date(Date.now() + 3600000),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        .status(200)
        .json({ 
          success: true,
          uid: decoded.uid, 
          email: userRecord.email, 
          username: admin.full_name,
          isAdmin: true,
          role: admin.role
        });
    } catch (err) {
      console.error("Admin signin error:", err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: err.message 
      });
    }
  };

export const adminSignout = (req, res) => {
  res.clearCookie("admin_token");
  res.status(200).json("Admin signout success!");
};