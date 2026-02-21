import express from 'express';
import {
  getDiagnostic,
  generateQuiz,
  getQuizById,
  getQuestionsByDifficulty,
  submitAttempt,
  predictNextLevel,
  getNextQuestion,
  getDashboard,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/diagnostic', getDiagnostic);
router.get('/dashboard', protect, getDashboard);
router.get('/questions/:difficulty', protect, getQuestionsByDifficulty);
router.get('/next-question', protect, getNextQuestion);
router.get('/:id', protect, getQuizById);
router.post('/generate', protect, generateQuiz);
router.post('/submit-attempt', protect, submitAttempt);
router.post('/predict-level', protect, predictNextLevel);

export default router;
