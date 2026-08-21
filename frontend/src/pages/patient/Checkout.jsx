import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService.js';
import paymentService from '../../services/paymentService.js';
import Loader from '../../components/common/Loader.jsx';
import { Shield, AlertTriangle, ArrowLeft, CreditCard, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const Checkout = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment states
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // 'idle', 'initiating', 'paying', 'verifying', 'failed', 'cancelled'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(res.appointment);
      } catch (err) {
        setError(err.message || 'Failed to retrieve appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentDetails();
  }, [appointmentId]);

  // Load Razorpay Checkout Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch secure checkout
  const handlePayment = async () => {
    setCheckoutStatus('initiating');
    setErrorMessage('');

    try {
      // 1. Create order on the backend (uses doctor fee dynamically)
      const orderRes = await paymentService.createOrder({
        appointmentId,
        paymentMethod: 'razorpay',
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order.');
      }

      const { keyId, orderId, amount, currency, patient } = orderRes;

      // 2. Load the official Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay payment script. Please verify your connection.');
      }

      setCheckoutStatus('paying');

      // 3. Configure options for the real Razorpay overlay
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'MedBook Healthcare',
        description: `Consultation Fee with Dr. ${appointment?.doctor?.user?.name || 'Doctor'}`,
        image: '/logo192.png',
        order_id: orderId,
        handler: async (response) => {
          setCheckoutStatus('verifying');
          try {
            // 4. Send credentials to backend to verify signature
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });

            if (verifyRes.success) {
              navigate(`/patient/payment/success/${verifyRes.payment?._id || 'success'}`);
            } else {
              navigate(`/patient/payment/failed/${verifyRes.payment?._id || 'failed'}`);
            }
          } catch (err) {
            setCheckoutStatus('failed');
            setErrorMessage(err.message || 'Signature verification request failed.');
            navigate(`/patient/payment/failed/error?reason=${encodeURIComponent(err.message)}`);
          }
        },
        prefill: {
          name: patient?.name || '',
          email: patient?.email || '',
        },
        notes: {
          appointmentId,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setCheckoutStatus('cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setCheckoutStatus('failed');
      setErrorMessage(err.message || 'An error occurred while launching payment gateway.');
    }
  };

  if (loading) return <Loader message="Setting up secure checkout..." />;
  if (error) return <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}><AlertTriangle color="red" /> {error}</div>;
  if (!appointment) return <div style={{ padding: '2rem', textAlign: 'center' }}>Appointment not found.</div>;

  const docName = appointment.doctor?.user?.name ? `Dr. ${appointment.doctor.user.name}` : 'Doctor';
  const feeAmount = appointment.doctor?.consultationFee || 500;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <button 
        onClick={() => navigate('/patient/appointments')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Appointments
      </button>

      <div className="card" style={{ padding: '2rem', background: '#ffffff', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Review Consultation Fee
        </h2>

        {/* Doctor Consultation Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {docName.substring(4, 6)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{docName}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {appointment.doctor?.specialization || 'Consultant'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Appointment Date:</span>
            <span style={{ fontWeight: 600 }}>{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consultation Time:</span>
            <span style={{ fontWeight: 600 }}>{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Appointment Status:</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--secondary)' }}>{appointment.status}</span>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            <span>Total Payable:</span>
            <span>₹{feeAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Warning / Error Messages */}
        {errorMessage && (
          <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {checkoutStatus === 'cancelled' && (
          <div style={{ padding: '0.85rem 1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-md)', color: '#b45309', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Payment cancelled by user. You can try pay again.
          </div>
        )}

        {/* Action Trigger */}
        {checkoutStatus === 'idle' || checkoutStatus === 'failed' || checkoutStatus === 'cancelled' ? (
          <button
            onClick={handlePayment}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <CreditCard size={18} />
            Pay Now
          </button>
        ) : (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              padding: '0.9rem', 
              background: 'var(--bg-subtle)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 700
            }}
          >
            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <span>
              {checkoutStatus === 'initiating' && 'Creating Order...'}
              {checkoutStatus === 'paying' && 'Opening Gateway...'}
              {checkoutStatus === 'verifying' && 'Verifying Signature...'}
            </span>
          </div>
        )}

        {/* Secure Checkout Seal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.25rem' }}>
          <Shield size={14} style={{ color: '#22c55e' }} /> Secured and Encrypted by Razorpay Gateway
        </div>

      </div>
    </div>
  );
};

export default Checkout;
