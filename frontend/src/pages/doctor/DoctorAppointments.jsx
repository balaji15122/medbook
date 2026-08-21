import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService.js';
import appointmentService from '../../services/appointmentService.js';
import AppointmentRequest from '../../components/doctor/AppointmentRequest.jsx';
import Loader from '../../components/common/Loader.jsx';
import { CalendarX, Pill } from 'lucide-react';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctorAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Fetch doctor appointments failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirmAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Confirm failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.completeAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Complete failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Cancel failed');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Doctor Appointment Schedule
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Manage incoming appointment requests, confirm patient bookings, and update visit statuses.
        </p>
      </div>

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
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: filter === tab ? 'var(--secondary)' : 'var(--bg-subtle)',
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
              : appointments.filter((a) => a.status === tab).length}
            )
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Loading appointment queue..." />
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <CalendarX size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: 0 }}>No {filter} appointments</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Appointments in this category will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map((appt) => (
            <AppointmentRequest
              key={appt._id}
              appointment={appt}
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
