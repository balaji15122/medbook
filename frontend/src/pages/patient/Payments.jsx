import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService.js';
import Loader from '../../components/common/Loader.jsx';
import { CreditCard, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await paymentService.getMyPayments();
        setPayments(res.payments || []);
      } catch (err) {
        console.error('Fetch payments error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalSpent = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Invoices & Payment History
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Track consultation fee payments, transaction receipts, and payment statuses.
        </p>
      </div>

      {/* Summary Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem 2rem',
          background: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Healthcare Spend
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '0.1rem 0 0' }}>
            {formatCurrency(totalSpent)}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{payments.length}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
              {payments.filter((p) => p.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <Loader message="Loading invoices..." />
      ) : payments.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <CreditCard size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: 0 }}>No Payment Transactions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            When you pay doctor consultation fees, your receipts will be recorded here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', background: '#ffffff' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Invoice / Doctor</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Method</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                        Dr. {p.doctor?.user?.name || 'Doctor'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.razorpayPaymentId || p.razorpayOrderId || p._id}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {formatDate(p.paidAt || p.createdAt)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textTransform: 'capitalize' }}>
                      {p.paymentMethod || 'Online'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {p.status === 'completed' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} /> Paid
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={11} /> {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
