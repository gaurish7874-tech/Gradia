import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const levelMap = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' };

export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const users = await User.find()
      .select('name totalPoints currentLevel')
      .sort({ totalPoints: -1 })
      .limit(limit)
      .lean();
    const list = users.map((u, i) => ({
      _id: u._id,
      name: u.name,
      points: u.totalPoints ?? 0,
      level: levelMap[u.currentLevel] || 'beginner',
      levelRank: Math.floor((u.totalPoints ?? 0) / 100) + 1,
    }));
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const getBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('badges').lean();
    res.status(200).json({ status: 'success', badges: user?.badges || [] });
  } catch (err) {
    next(err);
  }
};
