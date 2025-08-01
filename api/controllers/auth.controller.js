import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { errorHandler } from '../utils/error.js';


export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "Email already exists"));
    }

    const newUser = await User.create({
      full_name: username,
      email,
      password,
      role: "user"
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};


export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(errorHandler(401, "Invalid password"));
    }

    const token = generateToken(user._id, user.role === 'admin');
    
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      email: user.email,
      username: user.full_name,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};


// Google sign-in
export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Create random password for Google auth users
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        full_name: name,
        email,
        password: randomPassword,
        profilePicture: photo,
        role: "user"
      });
    }

    const token = generateToken(user._id, user.role === 'admin');

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.full_name,
      photo: user.profilePicture,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};


export const signout = (req, res) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({
      success: true,
      message: "Signout successful!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signout failed"
    });
  }
};
