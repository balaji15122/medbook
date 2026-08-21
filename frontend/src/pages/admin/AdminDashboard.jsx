import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService.js';
import StatsCard from '../../components/admin/StatsCard.jsx';
import DoctorTable from '../../components/admin/DoctorTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Users, UserCheck, Calendar, DollarSign, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllDoctors({ isVerified: false }),
      ]);
      setStats(statsRes.stats || null);
      setPendingDoctors(docsRes.doctors || []);
    } catch (err) {
      console.error('Admin dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerifyDoctor = async (doctorId, isVerified) => {
    try {
      await adminService.verifyDoctor(doctorId, isVerified);
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  if (loading) {
    return <Loader message="Loading administrator control center..." />;
  }

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Platform Overview & Metrics
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Monitor system users, verify practitioner licenses, and review platform transactions.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <StatsCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalPatients || 0} active patients`}
          icon={Users}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatsCard
          title="Verified Doctors"
          value={stats?.totalDoctors || 0}
          subtitle="Healthcare Specialists"
          icon={UserCheck}
          color="#0d9488"
          bg="#f0fdfa"
        />
        <StatsCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          subtitle={`${stats?.completedAppointments || 0} completed`}
          icon={Calendar}
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <StatsCard
          title="Gross Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Platform Volume"
          icon={DollarSign}
          color="#10b981"
          bg="#ecfdf5"
        />
      </div>

      {/* Pending Doctor Approvals */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              Doctors Awaiting Verification ({pendingDoctors.length})
            </h2>
          </div>
          <Link
            to="/admin/doctors"
            style={{
              fontSize: '0.875rem',
              color: 'var(--primary)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Manage All Doctors <ArrowRight size={14} />
          </Link>
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', color: 'var(--text-muted)' }}>
            No new doctor accounts currently awaiting verification.
          </div>
        ) : (
          <DoctorTable doctors={pendingDoctors} onVerify={handleVerifyDoctor} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
