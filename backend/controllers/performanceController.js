import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import { AppError } from '../utils/AppError.js';
import { predictLevel } from '../services/mlService.js';
import { generateFeedback } from '../services/aiFeedbackService.js';

export const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionId, correct, topic, timeTaken, attempts } = req.body;
    if (!questionId) throw new AppError(400, 'questionId is required');
    const question = await Question.findById(questionId);
    if (!question) throw new AppError(404, 'Question not found');
    const isCorrect = correct === true;
    const score = isCorrect ? 10 : 4;
    const normalizedTimeTaken = Math.max(0, Number(timeTaken) || 1);
    const normalizedAttempts = Math.max(1, Number(attempts) || 1);
    const predictedLevel = predictLevel(score, normalizedTimeTaken, normalizedAttempts);
    const aiFeedback = await generateFeedback({
      score,
      topic: topic || question.topic,
      timeTaken: normalizedTimeTaken,
      attempts: normalizedAttempts,
      predictedLevel,
    });
    const attempt = await Attempt.create({
      userId,
      questionId,
      topic: topic || question.topic,
      score,
      timeTaken: normalizedTimeTaken,
      attempts: normalizedAttempts,
      isCorrect,
      predictedLevel,
      aiFeedback,
    });
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { currentLevel: predictedLevel },
        $inc: { totalPoints: isCorrect ? 10 : 2 },
      },
      { new: true }
    );
    const pointsEarned = isCorrect ? 10 : 2;
    const levelLabelMap = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' };
    const levelRank = Math.floor((user.totalPoints ?? 0) / 100) + 1;
    res.status(201).json({
      status: 'success',
      attempt: {
        id: attempt._id,
        score: attempt.score,
        isCorrect: attempt.isCorrect,
        predictedLevel: attempt.predictedLevel,
        aiFeedback: attempt.aiFeedback,
        timeTaken: attempt.timeTaken,
        attempts: attempt.attempts,
      },
      gamification: {
        pointsEarned,
        totalPoints: user.totalPoints,
        xp: user.totalPoints,
        levelRank,
      },
      user: {
        currentLevel: user.currentLevel,
        level: levelLabelMap[user.currentLevel] || 'beginner',
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
      score: a.score,
      timeTaken: a.timeTaken,
      attempts: a.attempts,
      predictedLevel: a.predictedLevel,
      aiFeedback: a.aiFeedback,
      createdAt: a.createdAt,
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
