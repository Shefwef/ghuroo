// utils/verifyAdmin.js
import { verifyToken } from "./jwt.js";
import { errorHandler } from "./error.js";

export const verifyAdmin = async (req, res, next) => {
  const token = req.cookies.admin_token;
  
  if (!token) return next(errorHandler(401, "Not authenticated as admin!"));

  try {
    const decoded = verifyToken(token);
    if (!decoded.admin) {
      return next(errorHandler(403, "Not authorized as admin!"));
    }
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Admin token is not valid!"));
  }
};