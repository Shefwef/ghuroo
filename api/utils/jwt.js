import jwt from 'jsonwebtoken';

export const generateToken = (userId, isAdmin = false) => {
  return jwt.sign(
    { id: userId, admin: isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};