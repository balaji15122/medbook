import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import doctorService from '../../services/doctorService.js';
import appointmentService from '../../services/appointmentService.js';
import DoctorStats from '../../components/doctor/DoctorStats.jsx';
import AppointmentRequest from '../../components/doctor/AppointmentRequest.jsx';
import DoctorEarnings from '../../components/doctor/DoctorEarnings.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Calendar, Clock, Pill, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [statsRes, apptRes] = await Promise.all([
        doctorService.getDoctorStats(),
        doctorService.getDoctorAppointments(),
      ]);
      setStats(statsRes.stats || null);
      setAppointments(apptRes.appointments || []);
    } catch (err) {
      console.error('Fetch doctor dashboard failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirmAppointment(id);
      fetchDoctorData();
    } catch (err) {
      alert(err.message || 'Confirm failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.completeAppointment(id);
      fetchDoctorData();
    } catch (err) {
      alert(err.message || 'Complete failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      fetchDoctorData();
    } catch (err) {
      alert(err.message || 'Cancel failed');
    }
  };

  if (loading) {
    return <Loader message="Loading doctor dashboard..." />;
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const upcomingConfirmed = appointments.filter((a) => a.status === 'confirmed');

  return (
    <div>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          marginBottom: '2rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} /> Doctor Practice Portal
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
            Welcome, Dr. {user?.name || 'Doctor'}!
          </h1>
          <p style={{ color: '#ccfbf1', fontSize: '0.95rem', margin: 0 }}>
            Manage consultation queues, patient health summaries, and digital prescriptions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/doctor/availability"
            className="btn btn-secondary"
            style={{ background: '#ffffff', color: '#0f766e', fontWeight: 700, gap: '0.4rem' }}
          >
            <Clock size={16} /> Set Working Hours
          </Link>
          <Link
            to="/doctor/prescription/create"
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid #ffffff', fontWeight: 700, gap: '0.4rem' }}
          >
            <Pill size={16} /> Write Rx
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DoctorStats stats={stats} />

      {/* Earnings Section */}
      <DoctorEarnings stats={stats} />

      {/* Pending Approval Requests */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
            Pending Appointment Requests ({pendingAppointments.length})
          </h2>
          <Link to="/doctor/appointments" style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            View Full Queue <ArrowRight size={14} />
          </Link>
        </div>

        {pendingAppointments.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', color: 'var(--text-muted)' }}>
            No pending appointment requests to approve right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingAppointments.map((appt) => (
              <AppointmentRequest
                key={appt._id}
                appointment={appt}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Schedule Queue */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.25rem' }}>
          Confirmed Upcoming Consultations ({upcomingConfirmed.length})
        </h2>

        {upcomingConfirmed.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', color: 'var(--text-muted)' }}>
            No confirmed appointments scheduled for today.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingConfirmed.map((appt) => (
              <AppointmentRequest
                key={appt._id}
                appointment={appt}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
