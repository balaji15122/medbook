import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Check, X, User, CheckCircle2, Video } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { getJoinButtonState } from '../../utils/appointmentTime.js';
import appointmentService from '../../services/appointmentService.js';

export const AppointmentRequest = ({ appointment: initialAppointment, onConfirm, onCancel, onComplete }) => {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(initialAppointment);
  const [btnState, setBtnState] = useState(() => getJoinButtonState(appointment, 5, true));
  const [loadingToken, setLoadingToken] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setAppointment(initialAppointment);
  }, [initialAppointment]);

  useEffect(() => {
    setBtnState(getJoinButtonState(appointment, 5, true));
    const interval = setInterval(() => {
      setBtnState(getJoinButtonState(appointment, 5, true));
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

  const patientName = appointment.patient?.user?.name || 'Patient';
  const email = appointment.patient?.user?.email || '';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          <User size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{patientName}</h4>
            <span
              className={`badge badge-${
                appointment.status === 'confirmed'
                  ? 'primary'
                  : appointment.status === 'completed'
                  ? 'success'
                  : appointment.status === 'cancelled'
                  ? 'danger'
                  : 'warning'
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> {formatDate(appointment.appointmentDate)}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} /> {appointment.startTime} - {appointment.endTime}
            </span>
          </div>

          {appointment.reason && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Reason: {appointment.reason}
            </div>
          )}
        </div>
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

        {appointment.status === 'pending' && onConfirm && (
          <button
            type="button"
            onClick={() => onConfirm(appointment._id)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.3rem' }}
          >
            <Check size={14} /> Confirm
          </button>
        )}

        {appointment.status === 'confirmed' && onComplete && (
          <button
            type="button"
            onClick={() => onComplete(appointment._id)}
            className="btn btn-success btn-sm"
            style={{ gap: '0.3rem' }}
          >
            <CheckCircle2 size={14} /> Mark Completed
          </button>
        )}

        {['pending', 'confirmed'].includes(appointment.status) && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(appointment._id)}
            className="btn btn-danger btn-sm"
            style={{ gap: '0.3rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
          >
            <X size={14} /> Cancel
          </button>
        )}
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

export default AppointmentRequest;
