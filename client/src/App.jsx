import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
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
      <div className="app">
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
    </AuthProvider>
  );
}
