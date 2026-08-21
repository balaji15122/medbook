import React from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, Star, Users } from 'lucide-react';

export const DoctorStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments || 0,
      icon: Calendar,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      title: 'Confirmed Visits',
      value: stats.confirmedAppointments || 0,
      icon: Clock,
      color: '#0d9488',
      bg: '#f0fdfa',
    },
    {
      title: 'Completed Consultations',
      value: stats.completedAppointments || 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      title: 'Patient Rating',
      value: stats.rating ? `${stats.rating.toFixed(1)} ★` : '5.0 ★',
      subtitle: `${stats.totalReviews || 0} reviews`,
      icon: Star,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.5rem',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={26} />
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.title}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'var(--text-primary)' }}>
                {item.value}
              </h3>
              {item.subtitle && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DoctorStats;
