import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new AppError(401, 'Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError(401, 'User no longer exists.');
    }
    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new AppError(403, 'Invalid or expired token'));
      return;
    }
    if (err.name === 'TokenExpiredError') {
      next(new AppError(403, 'Token expired. Please log in again.'));
      return;
    }
    next(err);
  }
};
