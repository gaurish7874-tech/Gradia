import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    gamificationApi.leaderboard(20)
      .then((res) => setList(Array.isArray(res) ? res : (res?.list || [])))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading leaderboard...</div>;

  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Top learners by points</p>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>#</th>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Level</th>
              <th style={{ padding: '0.75rem' }}>Rank</th>
              <th style={{ padding: '0.75rem' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u, i) => (
              <tr
                key={u._id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: user?.id === u._id ? 'rgba(99,102,241,0.1)' : undefined,
                }}
              >
                <td style={{ padding: '0.75rem' }}>{i + 1}</td>
                <td style={{ padding: '0.75rem' }}>{u.name} {user?.id === u._id && '(you)'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className={`badge-level ${u.level || 'beginner'}`}>{u.level || 'beginner'}</span>
                </td>
                <td style={{ padding: '0.75rem' }}>Lv.{u.levelRank ?? 1}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.points ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
