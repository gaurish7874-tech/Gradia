import express from 'express';
import { submitAnswer, submitDiagnostic, getProgress } from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/answer', submitAnswer);
router.post('/diagnostic', submitDiagnostic);
router.get('/progress', getProgress);

export default router;
