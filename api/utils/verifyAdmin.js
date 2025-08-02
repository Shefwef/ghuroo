// utils/verifyAdmin.js
import { verifyToken as verifyJWT } from "./jwt.js";
import { errorHandler } from "./error.js";

export const verifyAdmin = async (req, res, next) => {
  let token = req.cookies.admin_token || req.cookies.access_token;
  
  // If no token in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }
  
  if (!token) {
    return next(errorHandler(401, "Not authenticated as admin!"));
  }

  try {
    const decoded = verifyJWT(token);
    
    if (!decoded.admin) {
      return next(errorHandler(403, "Not authorized as admin!"));
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Admin token is not valid!"));
  }
};