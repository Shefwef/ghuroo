
import { verifyToken } from "./jwt.js";
import { errorHandler } from "./error.js";

export const verifyUser = async (req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) return next(errorHandler(401, "Not authenticated!"));

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(errorHandler(403, "Token is not valid!"));
  }
};
