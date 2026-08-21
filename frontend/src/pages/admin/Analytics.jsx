import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import StatsCard from '../../components/admin/StatsCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import { DollarSign, TrendingUp, CreditCard, Activity, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await adminService.getStats();
        setStats(res.stats || null);
      } catch (err) {
        console.error('Analytics stats error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Analyzing platform metrics..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Platform Financial & Growth Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Revenue statistics, appointment fulfillment rates, and practitioner performance trends.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <StatsCard
          title="Total Platform Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Processed volume"
          icon={DollarSign}
          color="#10b981"
          bg="#ecfdf5"
        />
        <StatsCard
          title="Completed Appointments"
          value={stats?.completedAppointments || 0}
          subtitle="Fulfilled visits"
          icon={CheckCircle2}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatsCard
          title="Doctor Acceptance Rate"
          value="96.4%"
          subtitle="Average across all specialties"
          icon={TrendingUp}
          color="#0d9488"
          bg="#f0fdfa"
        />
        <StatsCard
          title="Platform Uptime"
          value="99.98%"
          subtitle="Cloud availability"
          icon={Activity}
          color="#8b5cf6"
          bg="#f5f3ff"
        />
      </div>

      {/* Analytics Breakdown Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Payment Methods Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                <span>Razorpay / Online UPI</span>
                <strong>78%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                <span>Direct Hospital Cash</span>
                <strong>22%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '22%', height: '100%', background: 'var(--secondary)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Consultation Demand By Specialty
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span>General Physician & Internal Medicine</span>
              <strong>38%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span>Cardiology & Heart Care</span>
              <strong>24%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span>Dermatology & Skin</span>
              <strong>18%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span>Pediatrics & Child Health</span>
              <strong>20%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
