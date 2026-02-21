import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import { AppError } from '../utils/AppError.js';
import { predictLevel } from '../services/mlService.js';
import { generateFeedback } from '../services/aiFeedbackService.js';

export const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { quizId, questionId, correct, difficulty, topic } = req.body;
    if (!questionId) throw new AppError(400, 'questionId is required');
    const question = await Question.findById(questionId);
    if (!question) throw new AppError(404, 'Question not found');
    const score = correct ? 10 : 4;
    const timeTaken = 1;
    const attempts = 1;
    const predictedLevel = predictLevel(score, timeTaken, attempts);
    const aiFeedback = generateFeedback({
      score,
      topic: topic || question.topic,
      timeTaken,
      attempts,
      predictedLevel,
    });
    await Attempt.create({
      userId,
      questionId,
      topic: topic || question.topic,
      score,
      timeTaken,
      attempts,
      isCorrect: correct,
      predictedLevel,
      aiFeedback,
    });
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { currentLevel: predictedLevel },
        $inc: { totalPoints: correct ? 10 : 2 },
      },
      { new: true }
    );
    const pointsEarned = correct ? 10 : 2;
    const levelRank = Math.floor((user.totalPoints ?? 0) / 100) + 1;
    res.status(201).json({
      status: 'success',
      gamification: {
        pointsEarned,
        totalPoints: user.totalPoints,
        xp: user.totalPoints,
        levelRank,
      },
      newBadges: [],
    });
  } catch (err) {
    next(err);
  }
};

export const submitDiagnostic = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { score, total } = req.body;
    const pct = total > 0 ? (Number(score) / Number(total)) * 100 : 0;
    let level = 'easy';
    if (pct >= 70) level = 'hard';
    else if (pct >= 40) level = 'medium';
    const learningPath = level === 'hard' ? ['Advanced Topics', 'Algorithms', 'System Design'] : level === 'medium' ? ['General', 'Math', 'Science', 'Programming'] : ['General', 'Math', 'Science'];
    await User.findByIdAndUpdate(userId, {
      $set: {
        currentLevel: level,
        diagnosticCompleted: true,
        learningPath,
      },
    });
    const levelMap = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' };
    res.status(200).json({
      status: 'success',
      level: levelMap[level] || 'beginner',
      diagnosticCompleted: true,
      learningPath,
    });
  } catch (err) {
    next(err);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('questionId', 'topic')
      .lean();
    const totalAttempts = attempts.length;
    const correctAnswers = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
    const recent = attempts.map((a) => ({
      _id: a._id,
      quiz: { title: a.topic || 'Quiz' },
      topic: a.topic,
      correct: a.isCorrect,
      pointsEarned: a.isCorrect ? 10 : 2,
    }));
    res.status(200).json({
      status: 'success',
      stats: { totalAttempts, correctAnswers, accuracy },
      recent,
    });
  } catch (err) {
    next(err);
  }
};
