import React, { useState, useEffect, useMemo } from 'react';
import { performanceApi } from '../api';

const levelClassMap = {
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
};

const levelLabelMap = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

function toLevelClass(level) {
  return levelClassMap[level] || 'beginner';
}

function toLevelLabel(level) {
  return levelLabelMap[level] || 'Beginner';
}

function recommendationFromStats({ accuracy = 0, avgTime = 0, hardRate = 0 }) {
  if (accuracy >= 75 && hardRate >= 40) {
    return 'AI recommendation: push advanced quizzes and reduce answer time by focusing on first-pass confidence.';
  }
  if (accuracy >= 60) {
    return 'AI recommendation: stay on mixed medium/hard practice and review one weak topic after each session.';
  }
  if (avgTime > 2.5) {
    return 'AI recommendation: switch to shorter focused sessions and finish one easy set quickly before moving up.';
  }
  return 'AI recommendation: reinforce fundamentals with easy-medium quizzes and use feedback notes after each question.';
}

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceApi.getProgress()
      .then((res) => setData(res?.stats ? { stats: res.stats, recent: res.recent } : res))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const recent = data?.recent || [];

  const aiSummary = useMemo(() => {
    if (!recent.length) {
      return {
        avgTime: 0,
        hardRate: 0,
        streak: 0,
        levelCounts: { easy: 0, medium: 0, hard: 0 },
      };
    }

    const levelCounts = { easy: 0, medium: 0, hard: 0 };
    let timeTotal = 0;
    let timeCount = 0;
    for (const item of recent) {
      if (item.predictedLevel && levelCounts[item.predictedLevel] != null) {
        levelCounts[item.predictedLevel] += 1;
      }
      if (typeof item.timeTaken === 'number' && Number.isFinite(item.timeTaken)) {
        timeTotal += item.timeTaken;
        timeCount += 1;
      }
    }

    let streak = 0;
    for (const item of recent) {
      if (item.correct) streak += 1;
      else break;
    }

    const hardRate = recent.length ? (levelCounts.hard / recent.length) * 100 : 0;
    const avgTime = timeCount ? timeTotal / timeCount : 0;
    return { avgTime, hardRate, streak, levelCounts };
  }, [recent]);

  const aiNotes = recent.filter((item) => item.aiFeedback).slice(0, 8);
  const recommendation = recommendationFromStats({
    accuracy: stats.accuracy || 0,
    avgTime: aiSummary.avgTime,
    hardRate: aiSummary.hardRate,
  });
  const totalPredictions = aiSummary.levelCounts.easy + aiSummary.levelCounts.medium + aiSummary.levelCounts.hard;

  if (loading) return <div className="container">Loading progress...</div>;
  if (!data) return <div className="container">No progress data.</div>;

  return (
    <div className="container">
      <h1>Your Progress</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>AI avg. time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{aiSummary.avgTime.toFixed(2)}m</div>
        </div>
      </div>

      <div className="card ai-highlight-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0 }}>AI Performance Snapshot</h3>
            <p style={{ color: 'var(--muted)', margin: '0.4rem 0 0' }}>{recommendation}</p>
          </div>
          <div className="ai-chip">Current streak: {aiSummary.streak}</div>
        </div>

        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Predicted level distribution</div>
          <div className="ai-level-track">
            <div
              className="ai-level-segment ai-level-easy"
              style={{ width: `${totalPredictions ? (aiSummary.levelCounts.easy / totalPredictions) * 100 : 0}%` }}
            />
            <div
              className="ai-level-segment ai-level-medium"
              style={{ width: `${totalPredictions ? (aiSummary.levelCounts.medium / totalPredictions) * 100 : 0}%` }}
            />
            <div
              className="ai-level-segment ai-level-hard"
              style={{ width: `${totalPredictions ? (aiSummary.levelCounts.hard / totalPredictions) * 100 : 0}%` }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge-level beginner">Beginner: {aiSummary.levelCounts.easy}</span>
            <span className="badge-level intermediate">Intermediate: {aiSummary.levelCounts.medium}</span>
            <span className="badge-level advanced">Advanced: {aiSummary.levelCounts.hard}</span>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>AI Feedback Timeline</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {aiNotes.length ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {aiNotes.map((item) => (
              <div key={item._id} className="ai-feedback-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <strong>{item.topic || 'General'}</strong>
                  <span className={`badge-level ${toLevelClass(item.predictedLevel)}`}>
                    {toLevelLabel(item.predictedLevel)}
                  </span>
                </div>
                <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0' }}>{item.aiFeedback}</p>
                <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Score: {item.score ?? '-'} | Time: {typeof item.timeTaken === 'number' ? `${item.timeTaken.toFixed(2)}m` : '-'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No AI feedback yet. Complete a quiz question to generate your first coach note.</p>
        )}
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Recent activity</h2>
      <div className="card">
        {recent.length ? (
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
                  gap: '0.5rem',
                }}
              >
                <span>{p.quiz?.title || 'Quiz'} | {p.topic || '-'}</span>
                <span style={{ color: p.correct ? 'var(--success)' : 'var(--danger)' }}>
                  {p.correct ? 'Correct' : 'Incorrect'} {p.pointsEarned > 0 && `+${p.pointsEarned} pts`}
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
