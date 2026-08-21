import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService.js';
import Loader from '../../components/common/Loader.jsx';
import { AlertCircle, ArrowLeft, RefreshCw, HelpCircle, XCircle } from 'lucide-react';

export const PaymentFailed = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (paymentId === 'rejected' || paymentId === 'error') {
        setLoading(false);
        return;
      }
      try {
        const res = await paymentService.getPaymentById(paymentId);
        setPayment(res.payment);
      } catch (err) {
        setError(err.message || 'Failed to fetch transaction record.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [paymentId]);

  const handleRetry = () => {
    if (payment?.appointment?._id) {
      navigate(`/patient/checkout/${payment.appointment._id}`);
    } else {
      navigate('/patient/appointments');
    }
  };

  if (loading) return <Loader message="Analyzing transaction outcome..." />;

  const failureReason = payment?.failureReason || 'Verification signature mismatch or cancelled by user.';
  const transactionId = payment?._id || paymentId;

  return (
    <div style={{ maxWidth: '550px', margin: '3rem auto', padding: '0 1rem' }}>
      <div 
        className="card" 
        style={{ 
          padding: '2.5rem 2rem', 
          background: '#ffffff', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1.25rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div 
          style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: 'var(--radius-full)', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '0.5rem' 
          }}
        >
          <XCircle size={40} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#ef4444' }}>
            Payment Failed
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            We could not complete your transaction. No money was deducted from your account.
          </span>
        </div>

        {/* Details Wrapper */}
        <div 
          style={{ 
            width: '100%', 
            background: '#fff5f5', 
            border: '1px solid #fed7d7', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.25rem', 
            textAlign: 'left',
            margin: '0.5rem 0',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #fed7d7', fontWeight: 700, color: '#9b2c2c' }}>
            Transaction Information
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#742a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Transaction ID:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{transactionId}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
              <span>Declined Reason:</span>
              <span style={{ fontWeight: 600, color: '#c53030', background: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #feb2b2', marginTop: '0.2rem' }}>
                {failureReason}
              </span>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div style={{ textAlign: 'left', width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <HelpCircle size={16} style={{ flexShrink: 0, color: 'var(--text-secondary)', marginTop: '2px' }} />
          <div>
            If your account was debited, Razorpay will automatically process a refund back to your source account within 5-7 business days.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          <button 
            onClick={handleRetry}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: '#ef4444', borderColor: '#ef4444' }}
          >
            <RefreshCw size={15} /> Retry Payment
          </button>
          
          <button 
            onClick={() => navigate('/patient/appointments')}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={15} /> Back to Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
