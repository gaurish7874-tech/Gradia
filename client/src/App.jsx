import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ConstellationBackground from './components/ConstellationBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DiagnosticQuiz from './pages/DiagnosticQuiz';
import QuizTake from './pages/QuizTake';
import QuizGenerate from './pages/QuizGenerate';
import Leaderboard from './pages/Leaderboard';
import Progress from './pages/Progress';
import Roadmap from './pages/Roadmap';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app app-with-bg">
        <div className="animated-bg" aria-hidden="true">
          <span className="bg-stars stars-far" />
          <span className="bg-stars stars-near" />
          <span className="bg-aurora aurora-1" />
          <span className="bg-aurora aurora-2" />
          <span className="bg-orb orb-1" />
          <span className="bg-orb orb-2" />
          <span className="bg-orb orb-3" />
          <span className="bg-grid" />
          <span className="bg-vignette" />
          <ConstellationBackground />
        </div>
        <div className="app-shell">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="diagnostic" element={<DiagnosticQuiz />} />
              <Route path="quiz/generate" element={<QuizGenerate />} />
              <Route path="quiz/:id" element={<QuizTake />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="progress" element={<Progress />} />
              <Route path="roadmap" element={<Roadmap />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}
