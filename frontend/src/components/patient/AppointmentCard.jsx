import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CreditCard, XCircle, FileText, CheckCircle2, Video } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getJoinButtonState } from '../../utils/appointmentTime.js';
import appointmentService from '../../services/appointmentService.js';

export const AppointmentCard = ({
  appointment: initialAppointment,
  onCancel,
  onPay,
  onViewPrescription,
  onReview,
  userRole = 'patient',
}) => {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(initialAppointment);
  const [btnState, setBtnState] = useState(() => getJoinButtonState(appointment));
  const [loadingToken, setLoadingToken] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setAppointment(initialAppointment);
  }, [initialAppointment]);

  useEffect(() => {
    setBtnState(getJoinButtonState(appointment));
    const interval = setInterval(() => {
      setBtnState(getJoinButtonState(appointment));
    }, 10000);
    return () => clearInterval(interval);
  }, [appointment]);

  // Poll status of pending or confirmed appointments
  useEffect(() => {
    if (!appointment || (appointment.status !== 'pending' && appointment.status !== 'confirmed')) {
      return;
    }

    const pollStatus = async () => {
      try {
        const res = await appointmentService.getAppointmentById(appointment._id);
        if (res.success && res.appointment) {
          setAppointment(res.appointment);
        }
      } catch (err) {
        console.warn("Failed to poll appointment status:", err.message);
      }
    };

    // Poll every 12 seconds
    const statusInterval = setInterval(pollStatus, 12000);
    return () => clearInterval(statusInterval);
  }, [appointment?._id, appointment?.status]);

  const handleJoinCall = async () => {
    setLoadingToken(true);
    try {
      const res = await appointmentService.getJoinToken(appointment._id);
      if (res.success && res.token) {
        sessionStorage.setItem(`roomToken_${appointment._id}`, res.token);
        navigate(`/consultation/${appointment._id}`);
      } else {
        alert(res.message || 'Failed to join video room');
      }
    } catch (err) {
      alert(err.message || 'Failed to join video room');
    } finally {
      setLoadingToken(false);
    }
  };

  if (!appointment) return null;

  const doctorName = appointment.doctor?.user?.name
    ? `Dr. ${appointment.doctor.user.name}`
    : 'Doctor';
  const patientName = appointment.patient?.user?.name || 'Patient';
  const isPaid = appointment.paymentStatus === 'paid';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge status-confirmed">Confirmed</span>;
      case 'completed':
        return <span className="badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="badge status-cancelled">Cancelled</span>;
      default:
        return <span className="badge status-pending">Pending</span>;
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {userRole === 'patient' ? doctorName : patientName}
            </h3>
            {getStatusBadge(appointment.status)}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {userRole === 'patient'
              ? appointment.doctor?.specialization || 'Healthcare Specialist'
              : `Reason: ${appointment.reason || 'General Consultation'}`}
          </span>
        </div>

        {/* Date & Time pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: 'var(--bg-subtle)',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)' }}>
            <Calendar size={15} />
            <span>{formatDate(appointment.appointmentDate)}</span>
          </div>
          <span style={{ color: 'var(--border-hover)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--secondary)' }}>
            <Clock size={15} />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
        </div>
      </div>

      {appointment.reason && userRole === 'patient' && (
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            background: 'var(--primary-light)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <strong>Symptoms/Notes:</strong> {appointment.reason}
        </div>
      )}

      {/* Footer / Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payment:</span>
          {isPaid ? (
            <span
              className="badge badge-success"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <CheckCircle2 size={12} />
              Paid ({formatCurrency(appointment.doctor?.consultationFee || 500)})
            </span>
          ) : (
            <span className="badge badge-warning">
              Pending ({formatCurrency(appointment.doctor?.consultationFee || 500)})
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {btnState.show && (
            <button
              type="button"
              onClick={handleJoinCall}
              disabled={!btnState.enabled || loadingToken}
              className={`btn btn-${btnState.variant} btn-sm`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                animation: btnState.enabled ? 'pulse-green 1.5s infinite' : 'none',
                fontWeight: 600,
              }}
            >
              <Video size={14} />
              {loadingToken ? 'Connecting...' : btnState.text}
            </button>
          )}

          {userRole === 'patient' && !isPaid && appointment.status !== 'cancelled' && onPay && (
            <button
              onClick={() => onPay(appointment)}
              className="btn btn-success btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <CreditCard size={14} />
              Pay Fee
            </button>
          )}

          {appointment.status === 'completed' && userRole === 'patient' && onReview && (
            <button
              onClick={() => onReview(appointment)}
              className="btn btn-outline btn-sm"
            >
              Rate & Review
            </button>
          )}

          {onViewPrescription && (
            <button
              onClick={() => onViewPrescription(appointment)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <FileText size={14} />
              Prescription
            </button>
          )}

          {['pending', 'confirmed'].includes(appointment.status) && onCancel && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="btn btn-danger btn-sm"
              style={{ gap: '0.35rem', background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              <XCircle size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentCard;
