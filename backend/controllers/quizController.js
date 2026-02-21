import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { predictLevel } from '../services/mlService.js';
import { generateFeedback } from '../services/aiFeedbackService.js';

const diffClientToBackend = { beginner: 'easy', intermediate: 'medium', advanced: 'hard' };

function toClientQuestion(q) {
  return {
    _id: q._id,
    id: q._id,
    topic: q.topic,
    difficulty: q.difficulty,
    questionText: q.questionText,
    text: q.questionText || q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  };
}

export const getDiagnostic = async (req, res, next) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
    if (!questions.length) throw new AppError(404, 'No questions available for diagnostic');
    const clientQuestions = questions.map((q) => toClientQuestion(q));
    res.status(200).json({
      _id: 'diagnostic',
      topic: 'Diagnostic',
      questions: clientQuestions,
    });
  } catch (err) {
    next(err);
  }
};

export const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topic, difficulty, count, questionType } = req.body;
    const limit = Math.min(Number(count) || 5, 15);
    const backendDiff = diffClientToBackend[difficulty] || difficulty || 'easy';
    const safeDiff = ['easy', 'medium', 'hard'].includes(backendDiff) ? backendDiff : 'easy';
    const filter = { difficulty: safeDiff };
    if (topic && String(topic).trim()) filter.topic = new RegExp(String(topic).trim(), 'i');
    const questions = await Question.find(filter).limit(limit);
    if (!questions.length) {
      const any = await Question.find().limit(limit);
      if (!any.length) throw new AppError(404, 'No questions in database. Run seed script first.');
      questions.push(...any);
    }
    const title = `${topic || 'Quiz'} – ${difficulty || 'beginner'}`;
    const quiz = await Quiz.create({
      title,
      topic: topic || 'General',
      difficulty: backendDiff,
      userId,
      questions: questions.map((q) => ({
        _id: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        text: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: null,
      })),
    });
    res.status(201).json({
      _id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: difficulty || 'beginner',
      questions: quiz.questions.map(toClientQuestion),
    });
  } catch (err) {
    next(err);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).lean();
    if (!quiz) throw new AppError(404, 'Quiz not found');
    const clientQuestions = (quiz.questions || []).map((q) => toClientQuestion(q));
    res.status(200).json({
      _id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: clientQuestions,
    });
  } catch (err) {
    next(err);
  }
};

export const getQuestionsByDifficulty = async (req, res, next) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new AppError(400, 'Invalid difficulty');
    }
    const questions = await Question.find({ difficulty }).limit(20);
    if (!questions.length) {
      throw new AppError(404, `No questions found for difficulty: ${difficulty}`);
    }
    res.status(200).json({ status: 'success', questions });
  } catch (err) {
    next(err);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionId, timeTaken, attempts, selectedAnswer } = req.body;
    if (questionId == null || timeTaken == null) {
      throw new AppError(400, 'questionId and timeTaken are required');
    }
    const question = await Question.findById(questionId);
    if (!question) throw new AppError(404, 'Question not found');
    const isCorrect = question.correctAnswer === selectedAnswer;
    const score = isCorrect ? 10 : 4;
    const predictedLevel = predictLevel(score, Number(timeTaken), Number(attempts) || 1);
    const aiFeedback = generateFeedback({
      score: Number(score),
      topic: question.topic,
      timeTaken: Number(timeTaken),
      attempts: Number(attempts) || 1,
      predictedLevel,
    });
    const attempt = await Attempt.create({
      userId,
      questionId,
      topic: question.topic,
      score,
      timeTaken: Number(timeTaken),
      attempts: Number(attempts) || 1,
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
    res.status(201).json({
      status: 'success',
      attempt: {
        id: attempt._id,
        score: attempt.score,
        isCorrect: attempt.isCorrect,
        predictedLevel: attempt.predictedLevel,
        aiFeedback: attempt.aiFeedback,
      },
      user: {
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const predictNextLevel = async (req, res, next) => {
  try {
    const { score, timeTaken, attempts } = req.body;
    if (score == null || timeTaken == null) {
      throw new AppError(400, 'score and timeTaken are required');
    }
    const level = predictLevel(Number(score), Number(timeTaken), Number(attempts) || 1);
    res.status(200).json({ status: 'success', predicted_difficulty: level });
  } catch (err) {
    next(err);
  }
};

export const getNextQuestion = async (req, res, next) => {
  try {
    const { difficulty } = req.query;
    const level = difficulty || 'easy';
    if (!['easy', 'medium', 'hard'].includes(level)) {
      throw new AppError(400, 'Invalid difficulty');
    }
    const questions = await Question.find({ difficulty }).limit(1);
    const question = questions[0];
    if (!question) throw new AppError(404, 'No questions available for this level');
    res.status(200).json({
      status: 'success',
      question: {
        id: question._id,
        topic: question.topic,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: question.options,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('questionId', 'topic difficulty');
    const history = attempts.map((a) => ({
      id: a._id,
      topic: a.topic,
      score: a.score,
      timeTaken: a.timeTaken,
      predictedLevel: a.predictedLevel,
      createdAt: a.createdAt,
    }));
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
      history,
    });
  } catch (err) {
    next(err);
  }
};
