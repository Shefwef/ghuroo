// controllers/user.controller.js
import { auth } from "../firebase.js";
import { UserModel } from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Test
export const test = (req, res) => res.json({ message: "API is working!" });

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const paramId = req.params.id;
    
    if (uid !== paramId && req.user._id !== paramId && req.user.id !== paramId) {
      return next(errorHandler(401, "You can update only your own account!"));
    }

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


    if (Object.keys(userUpdates).length > 0) {
      const updatedUser = await UserModel.update(uid, userUpdates);
      
      res.status(200).json({
        _id: updatedUser.id,
        uid: updatedUser.id,
        username: updatedUser.full_name,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture || null,
        created_at: updatedUser.created_at
      });
    } else {
      const user = await UserModel.findById(uid);
      res.status(200).json({
        _id: user.id,
        uid: user.id,
        username: user.full_name,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
        created_at: user.created_at
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const paramId = req.params.id;

    if (uid !== paramId && req.user._id !== paramId && req.user.id !== paramId) {
      return next(errorHandler(401, "You can delete only your own account!"));
    }

    await auth.deleteUser(uid);
    
    await UserModel.delete(uid);

    res.status(200).json({ message: "User has been deleted successfully" });
  } catch (error) {
    next(error);
  }
};

