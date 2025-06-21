
import { auth, db } from "../firebase.js";
import { UserModel } from "../models/user.model.js";

export const adminTest = (req, res) => res.json({ message: "Admin API is working!" });

export const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAll();

    const formattedUsers = users.map(user => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }));

    res.status(200).json(formattedUsers);    
  } catch (err) {
    next(err);
  }
};

export const deleteUserAsAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await auth.deleteUser(userId);
    await UserModel.delete(userId);
    res.status(200).json("User has been deleted by admin");
  } catch (err) {
    next(err);
  }
};