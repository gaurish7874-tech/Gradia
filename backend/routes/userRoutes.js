import express from 'express';
import { getRoadmap, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/roadmap', getRoadmap);
router.patch('/profile', updateProfile);

export default router;
