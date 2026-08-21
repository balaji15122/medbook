import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService.js';
import Loader from '../../components/common/Loader.jsx';
import { CheckCircle2, Calendar, Clock, DollarSign, Printer, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (paymentId === 'done') {
        // Mock fallback if page called with dummy code
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

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) return <Loader message="Verifying payment completion..." />;
  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }} className="card">
        <CheckCircle2 size={64} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Your payment was processed successfully. However, we couldn't load the detailed receipt details ({error}).
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/patient/appointments')}>
          Back to Appointments
        </button>
      </div>
    );
  }

  // Fallback calculations for mock transactions
  const docName = payment?.doctor?.user?.name ? `Dr. ${payment.doctor.user.name}` : 'Doctor';
  const patName = payment?.patient?.user?.name || 'Patient';
  const amount = payment?.amount || 500;
  const payDate = payment?.paidAt || payment?.createdAt || new Date();

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Success Card */}
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
            background: 'rgba(34, 197, 94, 0.1)', 
            color: 'var(--success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '0.5rem' 
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
            Payment Successful!
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Thank you. Your consultation has been confirmed and scheduled.
          </span>
        </div>

        {/* Print Layout Envelope Wrapper */}
        <div 
          id="receipt-print-area"
          style={{ 
            width: '100%', 
            background: 'var(--bg-subtle)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.5rem', 
            textAlign: 'left',
            margin: '0.5rem 0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>MEDBOOK RECEIPT</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Electronic Voucher</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date:</span>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{new Date(payDate).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Patient:</span>
              <span style={{ fontWeight: 600 }}>{patName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Doctor:</span>
              <span style={{ fontWeight: 600 }}>{docName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
              <span style={{ fontWeight: 600 }}>{payment?.doctor?.specialization || 'Consultant'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Appointment:</span>
              <span style={{ fontWeight: 600 }}>
                {payment?.appointment?.appointmentDate ? formatDate(payment.appointment.appointmentDate) : 'Confirmed Slot'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{payment?._id || paymentId}</span>
            </div>
            {payment?.razorpayPaymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Razorpay Payment ID:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{payment.razorpayPaymentId}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{payment?.paymentMethod || 'razorpay'}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              <span>Total Paid:</span>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          <button 
            onClick={handlePrintReceipt}
            className="btn btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <Printer size={15} /> Print Receipt
          </button>
          
          <button 
            onClick={() => navigate('/patient/appointments')}
            className="btn btn-primary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            Go to Portal <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            background: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
