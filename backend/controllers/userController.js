import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const defaultLearningPath = ['General', 'Math', 'Science'];

export const getRoadmap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('learningPath').lean();
    const learningPath = user?.learningPath?.length ? user.learningPath : defaultLearningPath;
    res.status(200).json({ status: 'success', learningPath });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const update = {};
    if (name != null) update.name = name.trim();
    if (email != null) update.email = email.toLowerCase().trim();
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    if (!user) throw new AppError(404, 'User not found');
    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        totalPoints: user.totalPoints,
        badges: user.badges,
      },
    });
  } catch (err) {
    next(err);
  }
};
