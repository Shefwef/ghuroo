// utils/verifyUser.js
import { auth } from "../firebase.js";
import { errorHandler } from "./error.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(401, "Not authenticated!"));

  try {
    const decoded = await auth.verifySessionCookie(token);
    req.user = { uid: decoded.uid };
    next();
  } catch {
    next(errorHandler(403, "Token is not valid!"));
  }
};
