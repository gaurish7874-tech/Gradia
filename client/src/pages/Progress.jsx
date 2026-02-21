import React, { useState, useEffect } from 'react';
import { performanceApi } from '../api';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceApi.getProgress()
      .then((res) => setData(res?.stats ? { stats: res.stats, recent: res.recent } : res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading progress...</div>;
  if (!data) return <div className="container">No progress data.</div>;

  const stats = data.stats || {};
  const recent = data.recent || [];

  return (
    <div className="container">
      <h1>Your Progress</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Total attempts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalAttempts}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Correct answers</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.correctAnswers}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Accuracy</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.accuracy?.toFixed(1) ?? 0}%</div>
        </div>
      </div>
      <h2 style={{ marginBottom: '1rem' }}>Recent activity</h2>
      <div className="card">
        {recent?.length ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recent.slice(0, 20).map((p) => (
              <li
                key={p._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span>{p.quiz?.title || 'Quiz'} · {p.topic || '-'}</span>
                <span style={{ color: p.correct ? 'var(--success)' : 'var(--danger)' }}>
                  {p.correct ? '✓' : '✗'} {p.pointsEarned > 0 && `+${p.pointsEarned} pts`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No attempts yet. Take a quiz to see progress here.</p>
        )}
      </div>
    </div>
  );
}
