import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  FileText,
  Pill,
  User,
  CreditCard,
} from 'lucide-react';

export const PatientLayout = () => {
  const patientNavLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/patient/book', label: 'Book Appointment', icon: PlusCircle },
    { to: '/patient/medical-records', label: 'Medical Records', icon: FileText },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
    { to: '/patient/payments', label: 'Invoices & Payments', icon: CreditCard },
    { to: '/patient/profile', label: 'Medical Profile', icon: User },
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
              Patient Portal
            </span>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
              {patientNavLinks.map((link) => {
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
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
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

export default PatientLayout;
