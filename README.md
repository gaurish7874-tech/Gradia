# LearnSphere — AI-Powered Adaptive Gamified Learning (MERN)

MERN stack hackathon project: adaptive quizzes, ML-based difficulty, and AI feedback.

## Quick start

### 1. Backend

```bash
cd learnsphere/backend
cp .env.example .env   # edit if needed
npm install
npm run seed           # seed question bank (required before quiz)
npm start
```

API runs at **http://localhost:5000**.

### 2. Frontend (client)

```bash
cd learnsphere/client
npm install
npm run dev
```

App runs at **http://localhost:5173** (proxies `/api` to backend).

### 3. MongoDB

Ensure MongoDB is running (e.g. `mongodb://localhost:27017`). Database `learnsphere_db` is created on first use. Verify in MongoDB Compass.

## Structure

- **backend/** — Express, Mongoose, JWT auth, quiz + attempt APIs, ML service (rule-based), AI feedback placeholder
- **client/** — Primary frontend: React (Vite), improved structure, Dashboard, Quiz, Progress, Leaderboard, Roadmap
- **frontend/** — Deprecated; use **client** instead

## API (all quiz routes require `Authorization: Bearer <token>`)

| Method | Route | Description |
|--------|--------|-------------|
| POST | `/api/auth/register` | Register (name, email, password) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/quiz/questions/:difficulty` | List questions by difficulty |
| GET | `/api/quiz/next-question?difficulty=` | Get one question for quiz |
| POST | `/api/quiz/submit-attempt` | Submit answer (questionId, timeTaken, attempts, selectedAnswer) |
| POST | `/api/quiz/predict-level` | Predict next difficulty (score, timeTaken, attempts) |
| GET | `/api/quiz/dashboard` | User + attempt history for chart |

## Team roles (3 members)

- **Dev 1 (Frontend):** React UI, Dashboard, Quiz/Result pages, Recharts
- **Dev 2 (Backend):** Express, MongoDB, auth, quiz/attempt APIs, ML logic
- **Dev 3 (Design + Deploy):** Figma, Vercel (client), Render/Railway (backend), MongoDB Atlas

## Demo flow

1. Register → Login
2. Dashboard: see level, points, progress chart
3. Start Next Lesson → one question (by current level)
4. Submit → Result with score, next level, AI feedback
5. Next Question or back to Dashboard
