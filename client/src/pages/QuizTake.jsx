import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi, performanceApi } from '../api';
import { useAuth } from '../context/AuthContext';

const levelClassMap = {
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

const levelLabelMap = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function toLevelClass(level) {
  return levelClassMap[level] || 'beginner';
}

function toLevelLabel(level) {
  return levelLabelMap[level] || 'Beginner';
}

function toPercent(value) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [typedCoachText, setTypedCoachText] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const { updateUser } = useAuth();

  useEffect(() => {
    quizApi.getById(id)
      .then(setQuiz)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setQuestionStartedAt(Date.now());
    setPointsEarned(0);
  }, [currentIndex, quiz?._id]);

  useEffect(() => {
    const text = feedback?.aiFeedback || '';
    if (!text) {
      setTypedCoachText('');
      return undefined;
    }

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedCoachText(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 14);

    return () => clearInterval(timer);
  }, [feedback?.aiFeedback]);

  const question = quiz?.questions?.[currentIndex];
  const isLast = quiz && currentIndex === quiz.questions.length - 1;

  const adaptiveSignals = useMemo(() => {
    if (!feedback) {
      return { speed: 0, mastery: 0, stability: 0, readiness: 0 };
    }
    const timeTaken = Number(feedback.timeTaken || 1);
    const attempts = Number(feedback.attempts || 1);
    const score = Number(feedback.score || (feedback.correct ? 10 : 4));
    const speed = Math.max(0, 100 - (timeTaken / 4) * 100);
    const mastery = (score / 10) * 100;
    const stability = Math.max(0, 100 - (attempts - 1) * 40);
    const readiness = mastery * 0.6 + speed * 0.25 + stability * 0.15;
    return { speed, mastery, stability, readiness };
  }, [feedback]);

  const submitAndNext = async () => {
    if (!question || selected === '') return;
    const correct = question.options
      ? selected === question.correctAnswer
      : selected.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

    const timeTakenMinutes = Math.max(0.1, Number(((Date.now() - questionStartedAt) / 60000).toFixed(2)));
    const baseFeedback = {
      correct,
      explanation: question.explanation,
      aiFeedback: '',
      predictedLevel: '',
      timeTaken: timeTakenMinutes,
      attempts: 1,
      score: correct ? 10 : 4,
    };

    try {
      const res = await performanceApi.submitAnswer({
        quizId: quiz._id,
        questionId: question._id,
        correct,
        difficulty: question.difficulty || quiz.difficulty || 'beginner',
        topic: question.topic || quiz.topic,
        timeTaken: timeTakenMinutes,
        attempts: 1,
      });

      setPointsEarned(res.gamification?.pointsEarned ?? 0);
      if (res.newBadges?.length) setNewBadges(res.newBadges);

      setFeedback({
        ...baseFeedback,
        aiFeedback: res.attempt?.aiFeedback || '',
        predictedLevel: res.attempt?.predictedLevel || '',
        timeTaken: res.attempt?.timeTaken ?? baseFeedback.timeTaken,
        attempts: res.attempt?.attempts ?? 1,
        score: res.attempt?.score ?? baseFeedback.score,
      });

      if (res.gamification || res.user) {
        updateUser({
          points: res.gamification?.totalPoints,
          xp: res.gamification?.xp,
          levelRank: res.gamification?.levelRank,
          currentLevel: res.user?.currentLevel,
          level: res.user?.level,
        });
      }
      return;
    } catch (_) {
      setFeedback(baseFeedback);
    }
  };

  const goNext = () => {
    setFeedback(null);
    setTypedCoachText('');
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
    <div className="container" style={{ maxWidth: '820px' }}>
      <h1>{quiz.title}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Question {currentIndex + 1} of {quiz.questions.length}
        {quiz.difficulty && (
          <span className={`badge-level ${toLevelClass(quiz.difficulty)}`} style={{ marginLeft: '0.5rem' }}>
            {toLevelLabel(quiz.difficulty)}
          </span>
        )}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ borderColor: feedback.correct ? 'var(--success)' : 'var(--danger)' }}>
            <p style={{ color: feedback.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 700, marginTop: 0 }}>
              {feedback.correct ? 'Correct' : 'Incorrect'}
              {pointsEarned > 0 && ` | +${pointsEarned} points`}
            </p>

            {feedback.predictedLevel && (
              <p style={{ margin: '0 0 0.75rem' }}>
                Next level:{' '}
                <span className={`badge-level ${toLevelClass(feedback.predictedLevel)}`}>
                  {toLevelLabel(feedback.predictedLevel)}
                </span>
              </p>
            )}

            <div style={{ display: 'grid', gap: '0.55rem', marginBottom: '0.9rem' }}>
              <div>
                <div className="ai-signal-label">Mastery</div>
                <div className="ai-signal-track"><div className="ai-signal-fill" style={{ width: toPercent(adaptiveSignals.mastery) }} /></div>
              </div>
              <div>
                <div className="ai-signal-label">Speed</div>
                <div className="ai-signal-track"><div className="ai-signal-fill" style={{ width: toPercent(adaptiveSignals.speed) }} /></div>
              </div>
              <div>
                <div className="ai-signal-label">Stability</div>
                <div className="ai-signal-track"><div className="ai-signal-fill" style={{ width: toPercent(adaptiveSignals.stability) }} /></div>
              </div>
              <div>
                <div className="ai-signal-label">Readiness</div>
                <div className="ai-signal-track"><div className="ai-signal-fill ai-signal-fill-strong" style={{ width: toPercent(adaptiveSignals.readiness) }} /></div>
              </div>
            </div>

            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              Score: {feedback.score ?? '-'} | Time: {typeof feedback.timeTaken === 'number' ? `${feedback.timeTaken.toFixed(2)}m` : '-'} | Attempts: {feedback.attempts || 1}
            </div>

            {feedback.explanation && <p style={{ color: 'var(--muted)', marginBottom: 0, marginTop: '0.85rem' }}>{feedback.explanation}</p>}
            {newBadges.length > 0 && (
              <p style={{ color: 'var(--warning)' }}>
                New badge(s): {newBadges.map((b) => `${b.icon} ${b.name}`).join(', ')}
              </p>
            )}
          </div>

          <div className="card ai-highlight-card">
            <div className="ai-coach-heading">
              <span className="ai-dot" />
              AI Coach
            </div>
            {feedback.aiFeedback ? (
              <p className="ai-coach-text">{typedCoachText}<span className="ai-caret" /></p>
            ) : (
              <p style={{ color: 'var(--muted)', marginTop: '0.8rem' }}>
                Coach feedback unavailable for this question. Continue to build your performance profile.
              </p>
            )}
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={goNext}>
                {isLast ? 'Finish quiz' : 'Next question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
