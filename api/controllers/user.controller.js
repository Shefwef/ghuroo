// controllers/user.controller.js
import { auth, db } from "../firebase.js";
import { errorHandler } from "../utils/error.js";

// Test
export const test = (req, res) => res.json({ message: "API is working!" });

// Update user
export const updateUser = async (req, res, next) => {
  const uid = req.user.uid;
  if (uid !== req.params.id) return next(errorHandler(401, "You can update only your own account!"));

  const updates = { ...req.body };
  if (updates.password) {
    await auth.updateUser(uid, { password: updates.password });
    delete updates.password;
  }
  await auth.updateUser(uid, { email: updates.email, displayName: updates.username });

  await db.collection("users").doc(uid).update({
    username: updates.username,
    email: updates.email,
    profilePicture: updates.profilePicture,
  });

  const userDoc = await db.collection("users").doc(uid).get();
  res.status(200).json({ uid, ...userDoc.data() });
};

// Delete user
export const deleteUser = async (req, res, next) => {
  const uid = req.user.uid;
  if (uid !== req.params.id) return next(errorHandler(401, "You can delete only your own account!"));

  await auth.deleteUser(uid);
  await db.collection("users").doc(uid).delete();

  res.status(200).json("User has been deleted...");
};
