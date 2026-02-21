import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new AppError(400, 'Name, email and password are required');
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError(409, 'User with this email already exists');
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });
    const token = signToken(user._id);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError(400, 'Email and password are required');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AppError(401, 'Invalid email or password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError(401, 'Invalid email or password');
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: toClientUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, 'User not found');
    res.status(200).json({
      status: 'success',
      user: toClientUser(user),
    });
  } catch (err) {
    next(err);
  }
};

function toClientUser(user) {
  const levelMap = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' };
  const level = levelMap[user.currentLevel] || 'beginner';
  const points = user.totalPoints ?? 0;
  const levelRank = Math.floor(points / 100) + 1;
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    currentLevel: user.currentLevel,
    level,
    totalPoints: user.totalPoints,
    points,
    xp: user.totalPoints,
    levelRank,
    badges: user.badges || [],
    diagnosticCompleted: user.diagnosticCompleted ?? false,
    learningPath: user.learningPath?.length ? user.learningPath : ['General', 'Math', 'Science'],
  };
}
