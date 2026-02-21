import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <header style={headerStyle}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <NavLink to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
            LearnSphere
          </NavLink>
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <NavLink to="/" className={navClass} end>Dashboard</NavLink>
            <NavLink to="/quiz/generate" className={navClass}>New Quiz</NavLink>
            <NavLink to="/progress" className={navClass}>Progress</NavLink>
            <NavLink to="/leaderboard" className={navClass}>Leaderboard</NavLink>
            <NavLink to="/roadmap" className={navClass}>Roadmap</NavLink>
            <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>
              {user?.points ?? 0} pts · Lv.{user?.levelRank ?? 1}
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem 0' }}>
        <Outlet />
      </main>
    </>
  );
}

const headerStyle = {
  background: 'var(--surface)',
  borderBottom: '1px solid var(--border)',
  padding: '0.75rem 0',
};

// Add to index.css or here via style tag
