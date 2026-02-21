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
  const delayStyle = (ms) => ({ '--enter-delay': `${ms}ms` });

  return (
    <div className="container page-enter">
      <h1 className="stagger-in" style={{ marginBottom: '0.5rem', ...delayStyle(40) }}>Welcome, {user?.name}!</h1>
      <p className="stagger-in" style={{ color: 'var(--muted)', marginBottom: '1rem', ...delayStyle(90) }}>
        Your level: <span className={`badge-level ${userLevel}`}>{userLevel}</span>
        {!user?.diagnosticCompleted && ' | Complete the diagnostic to get a personalized path.'}
      </p>

      <div className="card ai-highlight-card stagger-in" style={{ marginBottom: '1.5rem', ...delayStyle(140) }}>
        <div className="ai-coach-heading">
          <span className="ai-dot" />
          AI Coach Spotlight
        </div>
        <p className="ai-coach-text" style={{ marginTop: '0.75rem' }}>{recommendation}</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
          <Link className="btn btn-primary btn-float" to="/quiz/generate">Start AI Quiz</Link>
          <Link className="btn btn-secondary btn-float" to="/progress">View AI Insights</Link>
        </div>
      </div>

      <div className="dashboard-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {!user?.diagnosticCompleted && (
          <Link className="dashboard-card-link stagger-in" to="/diagnostic" style={{ textDecoration: 'none', ...delayStyle(180) }}>
            <div className="card dashboard-card card-hover-lift" style={{ cursor: 'pointer', borderColor: 'var(--accent)' }}>
              <h3 style={{ marginTop: 0 }}>Diagnostic Quiz</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
                Take a short quiz so the model can calibrate your learning level.
              </p>
            </div>
          </Link>
        )}
        <Link className="dashboard-card-link stagger-in" to="/quiz/generate" style={{ textDecoration: 'none', ...delayStyle(220) }}>
          <div className="card dashboard-card card-hover-lift" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>New Quiz (AI)</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Generate quizzes by topic and difficulty and get AI coaching each attempt.
            </p>
          </div>
        </Link>
        <Link className="dashboard-card-link stagger-in" to="/progress" style={{ textDecoration: 'none', ...delayStyle(260) }}>
          <div className="card dashboard-card card-hover-lift" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>AI Progress</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Inspect AI-level predictions, timeline feedback, and adaptive recommendations.
            </p>
          </div>
        </Link>
        <Link className="dashboard-card-link stagger-in" to="/leaderboard" style={{ textDecoration: 'none', ...delayStyle(300) }}>
          <div className="card dashboard-card card-hover-lift" style={{ cursor: 'pointer' }}>
            <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
              Compare points and level rank against other learners.
            </p>
          </div>
        </Link>
        <Link className="dashboard-card-link stagger-in" to="/roadmap" style={{ textDecoration: 'none', ...delayStyle(340) }}>
          <div className="card dashboard-card card-hover-lift" style={{ cursor: 'pointer' }}>
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
