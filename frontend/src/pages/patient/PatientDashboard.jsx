import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import patientService from '../../services/patientService.js';
import appointmentService from '../../services/appointmentService.js';
import AppointmentCard from '../../components/patient/AppointmentCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import {
  Calendar,
  Pill,
  FileText,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState({ prescriptions: [], medicalRecords: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [apptRes, histRes] = await Promise.all([
          appointmentService.getPatientAppointments({ limit: 3 }),
          patientService.getMyHistory(),
        ]);
        setAppointments(apptRes.appointments || []);
        if (histRes?.history) {
          setHistory(histRes.history);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading your patient health portal..." />;
  }

  const upcomingAppointments = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status)
  );

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
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
            <ShieldCheck size={14} /> Patient Health Portal
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem' }}>
            Welcome, {user?.name || 'Patient'}!
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: '0.95rem', margin: 0 }}>
            Track upcoming visits, prescription refills, and clinical medical summaries.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="btn btn-secondary"
          style={{ background: '#ffffff', color: '#1d4ed8', fontWeight: 700, gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> Book New Visit
        </Link>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Bookings</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.1rem 0 0' }}>{upcomingAppointments.length}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prescriptions</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.1rem 0 0' }}>{history.prescriptions?.length || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Medical Records</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.1rem 0 0' }}>{history.medicalRecords?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Upcoming Appointments</h2>
          <Link to="/patient/appointments" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: '#ffffff' }}>
            <Clock size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.35rem' }}>No upcoming appointments</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              You don't have any scheduled appointments at the moment.
            </p>
            <Link to="/patient/book" className="btn btn-primary btn-sm">
              Book a Consultation
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingAppointments.map((appt) => (
              <AppointmentCard key={appt._id} appointment={appt} userRole="patient" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
