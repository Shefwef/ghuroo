// controllers/user.controller.js
import { auth } from "../firebase.js";
import { UserModel } from "../models/user.model.js";
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
  
  // Update Firebase Auth user profile
    const authUpdates = {};
    if (updates.email) authUpdates.email = updates.email;
    if (updates.username) authUpdates.displayName = updates.username;
    
    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(uid, authUpdates);
    }

  const userUpdates = {};
    if (updates.username) userUpdates.full_name = updates.username;
    if (updates.email) userUpdates.email = updates.email;
    if (updates.profilePicture) userUpdates.profilePicture = updates.profilePicture;

  const updatedUser = await UserModel.update(uid, userUpdates);

  res.status(200).json({
      uid: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture || null,
      created_at: updatedUser.created_at });
};

// Delete user
export const deleteUser = async (req, res, next) => {
  const uid = req.user.uid;
  if (uid !== req.params.id) return next(errorHandler(401, "You can delete only your own account!"));

  await auth.deleteUser(uid);
  await UserModel.delete(uid);

  res.status(200).json("User has been deleted...");
};


// Get user profile
export const getUserProfile = async (req, res, next) => {
  const uid = req.user.uid;
  const user = await UserModel.findById(uid);
  
  if (!user) {
    return next(errorHandler(404, "User not found"));
  }

  res.status(200).json({
    uid: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  });

};