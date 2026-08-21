import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Star,
  BarChart3,
  HeartPulse,
} from 'lucide-react';

export const Sidebar = ({ role = 'admin' }) => {
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/doctors', label: 'Doctor Verification', icon: UserCheck },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/reviews', label: 'Reviews Moderation', icon: Star },
    { to: '/admin/analytics', label: 'Financial Analytics', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        minHeight: '100vh',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0 0.5rem 2rem 0.5rem',
          borderBottom: '1px solid #1e293b',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <HeartPulse size={20} />
        </div>
        <div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            Med<span style={{ color: '#60a5fa' }}>Admin</span>
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.65rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Control Center
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#2563eb' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'var(--transition)',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
