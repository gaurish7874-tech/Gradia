import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../api';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = [
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Programming',
  'Data Structures',
  'Algorithms',
  'English',
];

export default function QuizGenerate() {
  const [topic, setTopic] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const quiz = await quizApi.generate({
        topic,
        difficulty,
        count,
        questionType: 'mcq',
      });
      navigate('/quiz/' + quiz._id);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
  };

  return (
    <div className="container page-enter" style={{ maxWidth: '500px' }}>
      <h1 className="stagger-in" style={{ '--enter-delay': '40ms' }}>Generate AI Quiz</h1>
      <p className="stagger-in" style={{ color: 'var(--muted)', marginBottom: '1.5rem', '--enter-delay': '90ms' }}>
        Your level: <span className={`badge-level ${user?.level || 'beginner'}`}>{user?.level || 'Beginner'}</span>
        {' '}| MCQ questions come from a hardcoded subject bank (15 per subject).
      </p>
      <div className="card quiz-form-card stagger-in" style={{ '--enter-delay': '140ms' }}>
        {error && <p className="error-banner" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleGenerate}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Subject</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={inputStyle}
            className="animated-input"
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--muted)' }}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={inputStyle}
            className="animated-input"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--muted)' }}>Question type</label>
          <input
            type="text"
            value="Multiple Choice (MCQ only)"
            disabled
            style={{ ...inputStyle, opacity: 0.8 }}
            className="animated-input"
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--muted)' }}>Number of questions (max 15)</label>
          <input
            type="number"
            min={1}
            max={15}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 5)}
            style={inputStyle}
            className="animated-input"
          />

          <button type="submit" className="btn btn-primary btn-float" disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
            {loading ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              'Generate and start quiz'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
