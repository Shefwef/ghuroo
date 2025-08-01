import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { errorHandler } from '../utils/error.js';

export const adminSignup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email already exists"));
    }

    const newAdmin = await User.create({
      full_name: username,
      email,
      password,
      role: "admin"
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    next(err);
  }
};

export const adminSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return next(errorHandler(404, "Admin not found"));
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return next(errorHandler(401, "Invalid password"));
    }

    const token = generateToken(admin._id, true);

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      _id: admin._id,
      email: admin.email,
      username: admin.full_name,
      role: admin.role
    });
  } catch (err) {
    next(err);
  }
};

export const adminSignout = (req, res) => {
  res.clearCookie("admin_token");
  res.status(200).json("Admin signout success!");
};