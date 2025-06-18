// controllers/auth.controller.js
import { auth, db } from "../firebase.js";

import admin from "../firebase.js";


export const signup = async (req, res, next) => {

 
const username = req.body.username;
const email = req.body.email;
const password = req.body.password;

if (!username || !email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}


  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    await db.collection("users").doc(userRecord.uid).set({
      username,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};


export const signin = async (req, res, next) => {
  const { idToken } = req.body;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decoded.uid);

    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const profile = userDoc.data();

    res
      .cookie("access_token", idToken, { httpOnly: true, expires: new Date(Date.now() + 3600000) })
      .status(200)
      .json({ uid: decoded.uid, email: userRecord.email, username: profile.username });
  } catch (err) {
    next(err);
  }
};


// Google sign-in
export const google = async (req, res, next) => {
  const { email, name, photo } = req.body;
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch {
      userRecord = await auth.createUser({ email, displayName: name });
      await db.collection("users").doc(userRecord.uid).set({ username: name, email, photo });
    }

    const firebaseToken = await auth.createCustomToken(userRecord.uid);
    res
      .cookie("access_token", firebaseToken, { httpOnly: true, expires: new Date(Date.now() + 3600000) })
      .status(200)
      .json({ uid: userRecord.uid, email, username: userRecord.displayName, photo });
  } catch (err) {
    next(err);
  }
};

// Signout
export const signout = (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json("Signout success!");
};
