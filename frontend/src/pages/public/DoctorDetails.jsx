import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import doctorService from '../../services/doctorService.js';
import appointmentService from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import {
  Star,
  MapPin,
  Building,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export const DoctorDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slot booking state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.doctor);
        setReviews(res.reviews || []);
      } catch (err) {
        console.error('Fetch doctor details failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await appointmentService.getAvailableSlots(id, selectedDate);
        setSlots(res.slots || []);
      } catch (err) {
        console.warn('Slots fetch error:', err.message);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  const handleSlotClick = (slot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    if (user?.role !== 'patient') {
      alert('Only patient accounts can book doctor appointments.');
      return;
    }
    setBookingModalOpen(true);
    setBookingSuccess(false);
    setBookingError('');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      await appointmentService.bookAppointment({
        doctorId: id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
      });

      setBookingSuccess(true);
      // Re-fetch slots to update booking state
      const res = await appointmentService.getAvailableSlots(id, selectedDate);
      setSlots(res.slots || []);
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <Loader fullPage message="Loading doctor profile..." />;
  }

  if (!doctor) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Doctor Not Found</h2>
        <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Doctors
        </Link>
      </div>
    );
  }

  const doctorName = doctor.user?.name ? `Dr. ${doctor.user.name}` : 'Doctor';
  const profileImg =
    doctor.profileImage ||
    doctor.user?.profileImage ||
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Doctor Main Header Card */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            marginBottom: '2rem',
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <img
            src={profileImg}
            alt={doctorName}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: 'var(--radius-xl)',
              objectFit: 'cover',
              border: '3px solid var(--primary-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          />

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{doctorName}</h1>
                {doctor.isVerified && (
                  <span
                    className="badge badge-primary"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    <ShieldCheck size={14} /> Verified Doctor
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#fef3c7',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  color: '#b45309',
                }}
              >
                <Star size={16} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>{doctor.rating ? doctor.rating.toFixed(1) : '5.0'}</span>
                <span style={{ color: '#92400e', fontSize: '0.8rem', fontWeight: 500 }}>
                  ({doctor.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)', margin: '0 0 1rem' }}>
              {doctor.specialization || 'Healthcare Specialist'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} style={{ color: 'var(--primary)' }} />
                <span>
                  {doctor.qualification} • {doctor.experience}+ Years Experience
                </span>
              </div>

              {doctor.hospital && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} style={{ color: 'var(--secondary)' }} />
                  <span>{doctor.hospital}</span>
                </div>
              )}

              {doctor.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} style={{ color: 'var(--danger)' }} />
                  <span>{doctor.address ? `${doctor.address}, ` : ''}{doctor.city}</span>
                </div>
              )}
            </div>

            <div
              style={{
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Consultation Fee
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(doctor.consultationFee || 500)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid: Bio/Reviews + Interactive Booking Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="details-grid"
        >
          {/* Left Column: About & Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About Me */}
            <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                About Dr. {doctor.user?.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {doctor.about ||
                  `${doctorName} is a highly accomplished ${
                    doctor.specialization || 'physician'
                  } with over ${
                    doctor.experience
                  } years of extensive clinical experience in diagnosis, preventative care, and patient treatment.`}
              </p>
            </div>

            {/* Patient Reviews */}
            <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Patient Reviews ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  No reviews yet for this doctor. Be the first to consult and leave a review!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {rev.patient?.user?.name || 'Verified Patient'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.15rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              style={{
                                fill: i < rev.rating ? '#f59e0b' : '#e2e8f0',
                                color: i < rev.rating ? '#f59e0b' : '#e2e8f0',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        "{rev.comment || 'Great experience!'}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Booking Slot Calendar */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#ffffff',
              position: 'sticky',
              top: '90px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                Instant Booking
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                Select Date & Time Slot
              </h3>
            </div>

            {/* Date Picker Input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} /> Appointment Date
              </label>
              <input
                type="date"
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Slots Grid */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <Clock size={16} style={{ color: 'var(--secondary)' }} /> Available Time Slots
              </label>

              {loadingSlots ? (
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <Loader message="Checking slot availability..." />
                </div>
              ) : slots.length === 0 ? (
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  No working hours configured on this day. Please select another date.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '0.5rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '0.25rem',
                  }}
                >
                  {slots.map((slot, idx) => {
                    const isSelected =
                      selectedSlot &&
                      selectedSlot.startTime === slot.startTime &&
                      selectedSlot.endTime === slot.endTime;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        disabled={!slot.isAvailable}
                        style={{
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected
                            ? '2px solid var(--primary)'
                            : '1.5px solid var(--border-color)',
                          background: isSelected
                            ? 'var(--primary)'
                            : slot.isAvailable
                            ? '#ffffff'
                            : '#f1f5f9',
                          color: isSelected
                            ? '#ffffff'
                            : slot.isAvailable
                            ? 'var(--text-primary)'
                            : '#94a3b8',
                          fontWeight: isSelected ? 700 : 600,
                          fontSize: '0.8rem',
                          cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          transition: 'var(--transition)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.15rem',
                        }}
                      >
                        <span>{slot.startTime}</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {slot.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Slot Summary & Action */}
            {selectedSlot ? (
              <div
                style={{
                  background: 'var(--primary-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary-border)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Selected Appointment
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatDate(selectedDate)} at {selectedSlot.startTime} - {selectedSlot.endTime}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'center' }}>
                Please click an available time slot above to proceed
              </div>
            )}

            <Button
              variant="primary"
              disabled={!selectedSlot}
              onClick={handleOpenBooking}
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Book Appointment Now
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Confirm Appointment Booking"
      >
        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Appointment Booked Successfully!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your appointment with {doctorName} for {formatDate(selectedDate)} at{' '}
              {selectedSlot?.startTime} is now pending confirmation.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <Link to="/patient/appointments" className="btn btn-primary">
                View My Appointments
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking}>
            {bookingError && <ErrorMessage message={bookingError} />}

            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
              }}
            >
              <div><strong>Doctor:</strong> {doctorName} ({doctor.specialization})</div>
              <div><strong>Date & Time:</strong> {formatDate(selectedDate)} ({selectedSlot?.startTime} - {selectedSlot?.endTime})</div>
              <div><strong>Fee:</strong> {formatCurrency(doctor.consultationFee || 500)}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Visit / Symptoms (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your health symptoms or questions for the doctor..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" loading={bookingLoading}>
                Confirm & Book
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <style>{`
        @media (max-width: 880px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorDetails;
