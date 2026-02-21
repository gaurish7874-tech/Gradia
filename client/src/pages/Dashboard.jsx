import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Your level: <span className={`badge-level ${user?.level || 'beginner'}`}>{user?.level || 'Beginner'}</span>
        {!user?.diagnosticCompleted && ' · Complete the diagnostic to get a personalized path.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {!user?.diagnosticCompleted && (
          <Link to="/diagnostic" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderColor: 'var(--accent)' }}>
              <h3 style={{ marginTop: 0 }}>📋 Diagnostic Quiz</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
                Take a short quiz so we can assign your level and learning path.
              </p>
            </div>
          </Link>
        )}
        <Link to="/quiz/generate" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>✨ New Quiz (AI)</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Generate a quiz by topic and difficulty. Questions are created by AI.
            </p>
          </div>
        </Link>
        <Link to="/progress" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>📊 Progress</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              View your accuracy, recent attempts, and stats.
            </p>
          </div>
        </Link>
        <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>🏆 Leaderboard</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              See top learners by points and level.
            </p>
          </div>
        </Link>
        <Link to="/roadmap" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>🗺️ Roadmap</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Your learning path and next goals.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
