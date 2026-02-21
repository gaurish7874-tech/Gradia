import express from 'express';
import { getLeaderboard, getBadges } from '../controllers/gamificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/badges', protect, getBadges);

export default router;
