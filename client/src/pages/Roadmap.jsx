import React, { useState, useEffect } from 'react';
import { userApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    userApi.getRoadmap()
      .then((res) => setRoadmap(res?.learningPath ? { learningPath: res.learningPath } : res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading roadmap...</div>;

  const path = roadmap?.learningPath || user?.learningPath || ['General', 'Math', 'Science'];
  const levelRank = user?.levelRank ?? 1;
  const currentXP = user?.xp ?? 0;
  const xpForNextLevel = levelRank * 100;
  const xpAtLevelStart = (levelRank - 1) * 100;
  const progressToNext = xpForNextLevel > xpAtLevelStart
    ? Math.min(100, ((currentXP - xpAtLevelStart) / (xpForNextLevel - xpAtLevelStart)) * 100)
    : 0;

  return (
    <div className="container">
      <h1>Your Learning Roadmap</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Level <span className={`badge-level ${user?.level || 'beginner'}`}>{user?.level || 'Beginner'}</span>
        · Rank Lv.{user?.levelRank ?? 1} · {user?.points ?? 0} points
      </p>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Next level progress</h3>
        <div style={{ height: '12px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressToNext}%`,
              background: 'var(--accent)',
              borderRadius: '999px',
            }}
          />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Keep answering to level up (100 XP per rank).
        </p>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Learning path</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
          Topics recommended for your level. Generate quizzes from "New Quiz" for any topic.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {path.map((topic, i) => (
            <li
              key={topic}
              style={{
                padding: '0.75rem',
                borderBottom: i < path.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{i + 1}.</span>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
