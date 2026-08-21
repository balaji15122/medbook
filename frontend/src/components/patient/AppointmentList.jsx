import React, { useState } from 'react';
import AppointmentCard from './AppointmentCard.jsx';
import { CalendarX } from 'lucide-react';

export const AppointmentList = ({
  appointments = [],
  onCancel,
  onPay,
  onViewPrescription,
  onReview,
  userRole = 'patient',
}) => {
  const [filter, setFilter] = useState('all');

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(appt.status);
    if (filter === 'completed') return appt.status === 'completed';
    if (filter === 'cancelled') return appt.status === 'cancelled';
    return true;
  });

  return (
    <div>
      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: filter === tab ? 'var(--primary)' : 'var(--bg-subtle)',
              color: filter === tab ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'var(--transition)',
            }}
          >
            {tab} (
            {tab === 'all'
              ? appointments.length
              : appointments.filter((a) =>
                  tab === 'upcoming'
                    ? ['pending', 'confirmed'].includes(a.status)
                    : a.status === tab
                ).length}
            )
          </button>
        ))}
      </div>

      {/* Appointment Grid / List */}
      {filteredAppointments.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: '#ffffff',
          }}
        >
          <CalendarX size={44} style={{ color: 'var(--text-muted)' }} />
          <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>No {filter} appointments found</h4>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            When appointments are booked or updated, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancel={onCancel}
              onPay={onPay}
              onViewPrescription={onViewPrescription}
              onReview={onReview}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
