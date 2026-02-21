import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { predictLevel } from '../services/mlService.js';
import { generateFeedback } from '../services/aiFeedbackService.js';
import { getHardcodedQuestionsForSubject, resolveSubject } from '../services/hardcodedQuestionBank.js';

const diffClientToBackend = { beginner: 'easy', intermediate: 'medium', advanced: 'hard' };
const diffBackendToClient = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' };

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

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function ensureHardcodedSubjectQuestions(subject) {
  const bank = getHardcodedQuestionsForSubject(subject);
  if (!bank.length) return [];

  const existing = await Question.find({ topic: subject })
    .select('questionText difficulty')
    .lean();
  const existingKeys = new Set(
    existing.map((q) => `${q.difficulty}::${String(q.questionText || '').trim().toLowerCase()}`)
  );

  const missing = bank.filter(
    (q) => !existingKeys.has(`${q.difficulty}::${String(q.questionText || '').trim().toLowerCase()}`)
  );
  if (missing.length) {
    await Question.insertMany(missing);
  }

  return bank;
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
    const { topic, difficulty, count, questionType = 'mcq' } = req.body;
    const safeTopic = resolveSubject(topic);
    if (!safeTopic) throw new AppError(400, 'Please select a valid subject');
    if (String(questionType).toLowerCase() !== 'mcq') {
      throw new AppError(400, 'Only MCQ question type is supported');
    }

    const limit = Math.min(Number(count) || 5, 15);
    const backendDiff = diffClientToBackend[difficulty] || difficulty || 'easy';
    const safeDiff = ['easy', 'medium', 'hard'].includes(backendDiff) ? backendDiff : 'easy';

    const bank = await ensureHardcodedSubjectQuestions(safeTopic);
    if (!bank.length) {
      throw new AppError(500, 'No hardcoded questions available for this subject.');
    }
    const bankQuestionTexts = bank.map((q) => q.questionText);
    const subjectQuestions = await Question.find({
      topic: safeTopic,
      questionText: { $in: bankQuestionTexts },
    });

    const byDifficulty = subjectQuestions.filter((q) => q.difficulty === safeDiff);
    const picked = shuffle(byDifficulty).slice(0, limit);

    if (picked.length < limit) {
      const pickedIds = new Set(picked.map((q) => String(q._id)));
      const extras = shuffle(subjectQuestions).filter((q) => !pickedIds.has(String(q._id)));
      picked.push(...extras.slice(0, limit - picked.length));
    }

    if (picked.length < limit) {
      throw new AppError(500, 'Question bank is not ready for this subject yet.');
    }

    const quiz = await Quiz.create({
      title: `${safeTopic} - ${diffBackendToClient[safeDiff]}`,
      topic: safeTopic,
      difficulty: safeDiff,
      userId,
      questions: picked.map((q) => ({
        _id: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        text: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
      })),
    });

    res.status(201).json({
      _id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: diffBackendToClient[safeDiff],
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
    const aiFeedback = await generateFeedback({
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
    const questions = await Question.find({ difficulty: level }).limit(1);
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
