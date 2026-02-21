import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi, performanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function DiagnosticQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    quizApi.getDiagnostic()
      .then(setQuiz)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const question = quiz?.questions?.[currentIndex];
  const isLast = quiz && currentIndex === quiz.questions.length - 1;

  const handleNext = async () => {
    if (!question || selected === '') return;
    const correct = question.options
      ? selected === question.correctAnswer
      : selected.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    setResults((r) => [...r, { correct, questionId: question._id }]);
    try {
      await performanceApi.submitAnswer({
        quizId: quiz._id,
        questionId: question._id,
        correct,
        difficulty: 'beginner',
        topic: quiz.topic,
      });
    } catch (_) {}
    if (isLast) {
      setSubmitting(true);
      const score = [...results, { correct }].filter((r) => r.correct).length;
      const total = quiz.questions.length;
      try {
        const data = await performanceApi.submitDiagnostic({ score, total });
        updateUser({ level: data.level, diagnosticCompleted: true, learningPath: data.learningPath });
        navigate('/');
      } catch (e) {
        setError(e.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected('');
  };

  if (loading) return <div className="container">Loading diagnostic quiz...</div>;
  if (error && !quiz) return <div className="container" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!quiz) return null;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1>Diagnostic Quiz</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Question {currentIndex + 1} of {quiz.questions.length}
      </p>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{question?.text}</h3>
        {question?.options?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="choice"
                  checked={selected === opt}
                  onChange={() => setSelected(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            placeholder="Your answer"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected === '' || submitting}
          style={{ marginTop: '1rem' }}
        >
          {submitting ? 'Saving...' : isLast ? 'Finish diagnostic' : 'Next'}
        </button>
      </div>
    </div>
  );
}
