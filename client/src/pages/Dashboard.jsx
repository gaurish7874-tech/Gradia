import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function recommendationFromLevel(level) {
  if (level === 'advanced' || level === 'hard') {
    return 'AI recommends advanced mixed-topic sets with stricter time targets.';
  }
  if (level === 'intermediate' || level === 'medium') {
    return 'AI recommends alternating medium and hard questions to improve consistency.';
  }
  return 'AI recommends short beginner drills to build speed and confidence first.';
}

export default function Dashboard() {
  const { user } = useAuth();
  const userLevel = user?.level || 'beginner';
  const recommendation = recommendationFromLevel(userLevel);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        Your level: <span className={`badge-level ${userLevel}`}>{userLevel}</span>
        {!user?.diagnosticCompleted && ' | Complete the diagnostic to get a personalized path.'}
      </p>

      <div className="card ai-highlight-card" style={{ marginBottom: '1.5rem' }}>
        <div className="ai-coach-heading">
          <span className="ai-dot" />
          AI Coach Spotlight
        </div>
        <p className="ai-coach-text" style={{ marginTop: '0.75rem' }}>{recommendation}</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
          <Link className="btn btn-primary" to="/quiz/generate">Start AI Quiz</Link>
          <Link className="btn btn-secondary" to="/progress">View AI Insights</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {!user?.diagnosticCompleted && (
          <Link to="/diagnostic" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderColor: 'var(--accent)' }}>
              <h3 style={{ marginTop: 0 }}>Diagnostic Quiz</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
                Take a short quiz so the model can calibrate your learning level.
              </p>
            </div>
          </Link>
        )}
        <Link to="/quiz/generate" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>New Quiz (AI)</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Generate quizzes by topic and difficulty and get AI coaching each attempt.
            </p>
          </div>
        </Link>
        <Link to="/progress" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>AI Progress</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Inspect AI-level predictions, timeline feedback, and adaptive recommendations.
            </p>
          </div>
        </Link>
        <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Compare points and level rank against other learners.
            </p>
          </div>
        </Link>
        <Link to="/roadmap" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>Roadmap</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Follow your personalized sequence of topics and milestones.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
