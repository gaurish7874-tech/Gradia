import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg.includes('fetch') || msg.includes('Network') ? 'Cannot reach server. Is the backend running on port 5000?' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__video">
        <div className="login-page__video-inner">
          <video
            className="login-page__video-el"
            src="/login-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
      <div className="login-page__form-wrap">
        <div className="login-page__card">
          <h1 className="login-page__title">Log in to Gradia</h1>
          <p className="login-page__tagline">Welcome back. Continue your learning journey.</p>
          {error && <p className="login-page__error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label className="login-page__label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="login-page__input"
            />
            <label className="login-page__label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="login-page__input"
            />
            <button type="submit" className="btn login-page__submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="login-page__register">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
