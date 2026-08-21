import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Settings,
  Pill,
} from 'lucide-react';

export const DoctorLayout = () => {
  const doctorNavLinks = [
    { to: '/doctor/dashboard', label: 'Doctor Overview', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', label: 'Patient Records', icon: Users },
    { to: '/doctor/availability', label: 'Working Schedule', icon: Clock },
    { to: '/doctor/prescription/create', label: 'Write Prescription', icon: Pill },
    { to: '/doctor/profile', label: 'Practice Settings', icon: Settings },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <aside
          style={{
            width: '240px',
            flexShrink: 0,
            display: 'none',
          }}
          className="portal-sidebar"
        >
          <div className="card" style={{ padding: '1rem', background: '#ffffff', position: 'sticky', top: '90px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '0.5rem 0.75rem',
                display: 'block',
              }}
            >
              Doctor Portal
            </span>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
              {doctorNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: isActive ? 'var(--secondary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--secondary-light)' : 'transparent',
                      transition: 'var(--transition)',
                    })}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <Footer />

      <style>{`
        @media (min-width: 900px) {
          .portal-sidebar { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default DoctorLayout;
