import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminNavbar = ({ title = 'Administration' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Public Site
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Super Admin</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem', color: 'var(--danger)', borderColor: '#fca5a5' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
