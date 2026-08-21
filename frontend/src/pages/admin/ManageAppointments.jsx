import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import Loader from '../../components/common/Loader.jsx';
import { Calendar, Clock, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAllAppointments();
        setAppointments(res.appointments || []);
      } catch (err) {
        console.error('Fetch appointments error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Global Appointments Monitor
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Live feed of scheduled, confirmed, completed, and cancelled patient consultations.
        </p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loader message="Loading global appointments..." />
      ) : (
        <div className="card" style={{ overflow: 'hidden', background: '#ffffff' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Patient</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Doctor</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date & Time</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Fee</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Payment</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a) => (
                    <tr key={a._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                          {a.patient?.user?.name || 'Patient'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.patient?.user?.email}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                          Dr. {a.doctor?.user?.name || 'Doctor'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                          {a.doctor?.specialization}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {formatDate(a.appointmentDate)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.startTime} - {a.endTime}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                        {formatCurrency(a.doctor?.consultationFee || 500)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {a.paymentStatus === 'paid' ? (
                          <span className="badge badge-success" style={{ gap: '0.2rem' }}>
                            <CheckCircle2 size={11} /> Paid
                          </span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          className={`badge badge-${
                            a.status === 'confirmed'
                              ? 'primary'
                              : a.status === 'completed'
                              ? 'success'
                              : a.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
