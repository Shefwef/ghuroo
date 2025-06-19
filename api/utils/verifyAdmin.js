// utils/verifyAdmin.js
import { auth } from "../firebase.js";
import { errorHandler } from "./error.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const idToken = req.cookies.admin_token;
    if (!idToken) return next(errorHandler(401, 'Unauthorized - No admin token'));

    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded.admin) return next(errorHandler(403, 'Forbidden - Not an admin'));

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};