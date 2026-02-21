import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi, performanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const { updateUser } = useAuth();

  useEffect(() => {
    quizApi.getById(id)
      .then(setQuiz)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const question = quiz?.questions?.[currentIndex];
  const isLast = quiz && currentIndex === quiz.questions.length - 1;

  const submitAndNext = async () => {
    if (!question || selected === '') return;
    const correct = question.options
      ? selected === question.correctAnswer
      : selected.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    setFeedback({ correct, explanation: question.explanation });
    try {
      const res = await performanceApi.submitAnswer({
        quizId: quiz._id,
        questionId: question._id,
        correct,
        difficulty: question.difficulty || quiz.difficulty || 'beginner',
        topic: question.topic || quiz.topic,
      });
      setPointsEarned(res.gamification?.pointsEarned ?? 0);
      if (res.newBadges?.length) setNewBadges(res.newBadges);
      if (res.gamification) {
        updateUser({
          points: res.gamification.totalPoints,
          xp: res.gamification.xp,
          levelRank: res.gamification.levelRank,
        });
      }
    } catch (_) {}
  };

  const goNext = () => {
    setFeedback(null);
    setSelected('');
    setNewBadges([]);
    if (isLast) {
      navigate('/');
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  if (loading) return <div className="container">Loading quiz...</div>;
  if (error || !quiz) return <div className="container" style={{ color: 'var(--danger)' }}>{error || 'Quiz not found'}</div>;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1>{quiz.title}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Question {currentIndex + 1} of {quiz.questions.length}
        {quiz.difficulty && <span className={`badge-level ${quiz.difficulty}`} style={{ marginLeft: '0.5rem' }}>{quiz.difficulty}</span>}
      </p>

      {!feedback ? (
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
            onClick={submitAndNext}
            disabled={selected === ''}
            style={{ marginTop: '1rem' }}
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="card" style={{ borderColor: feedback.correct ? 'var(--success)' : 'var(--danger)' }}>
          <p style={{ color: feedback.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {feedback.correct ? '✓ Correct!' : '✗ Incorrect'}
            {pointsEarned > 0 && ` · +${pointsEarned} points`}
          </p>
          {feedback.explanation && <p style={{ color: 'var(--muted)' }}>{feedback.explanation}</p>}
          {newBadges.length > 0 && (
            <p style={{ color: 'var(--warning)' }}>
              New badge(s): {newBadges.map((b) => `${b.icon} ${b.name}`).join(', ')}
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={goNext} style={{ marginTop: '1rem' }}>
            {isLast ? 'Finish quiz' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}
