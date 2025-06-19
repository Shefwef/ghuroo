
import { auth, db } from "../firebase.js";

export const adminTest = (req, res) => res.json({ message: "Admin API is working!" });

export const getUsers = async (req, res, next) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);    
  } catch (err) {
    next(err);
  }
};

export const deleteUserAsAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await auth.deleteUser(userId);
    await db.collection("admins").doc(userId).delete();
    res.status(200).json("User has been deleted by admin");
  } catch (err) {
    next(err);
  }
};