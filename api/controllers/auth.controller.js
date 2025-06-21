// controllers/auth.controller.js
import { auth} from "../firebase.js";
import { UserModel } from "../models/user.model.js";


export const signup = async (req, res, next) => {

 
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

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    await UserModel.create({
      id: userRecord.uid,
      full_name: username,
      email: email,
      role: "user"
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};


export const signin = async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }
  
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decoded.uid);

    const user = await UserModel.findById(decoded.uid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
      res.cookie('access_token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
      });

      
      res.status(200)
      .json({ uid: decoded.uid, email: userRecord.email, username: user.full_name, role:user.role });
  } catch (err) {
    next(err);
  }
};


// Google sign-in
export const google = async (req, res, next) => {
  const { email, name, photo } = req.body;
  try {
    let userRecord;
    let user;

    try {
      userRecord = await auth.getUserByEmail(email);
      user = await UserModel.findById(userRecord.uid);

      if (!user) {
        user = await UserModel.create({ 
          id: userRecord.uid, 
          full_name: name, 
          email: email, 
          role: "user" 
        });
      }

    } catch {
      userRecord = await auth.createUser({ email, displayName: name });
      user = await UserModel.create({ id: userRecord.uid, full_name: name, email: email, role: "user" });
    }

    
    if (!user) {
    return res.status(500).json({ message: "Failed to create or retrieve user" });
    }

    const firebaseToken = await auth.createCustomToken(userRecord.uid);
    res
      .cookie("access_token", firebaseToken, { httpOnly: true, expires: new Date(Date.now() + 3600000) })
      .status(200)
      .json({ uid: userRecord.uid, email, username: user.full_name, photo, role: user.role });
  } catch (err) {
    next(err);
  }
};


export const signout = (req, res) => {
  try {
   
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    res.status(200).json({
      success: true,
      message: "Signout successful!"
    });

  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      message: "Signout failed"
    });
  }
};
