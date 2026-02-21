import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
// Allow primary frontend (client) and legacy frontend; CLIENT_ORIGIN overrides in .env
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
});
app.use(errorHandler);

export default app;
