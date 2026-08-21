import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService.js';
import appointmentService from '../../services/appointmentService.js';
import DoctorSearch from '../../components/patient/DoctorSearch.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { Calendar, Clock, Star, CheckCircle2, User, Building, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export const BookAppointment = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  // Selected state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDoctors = async () => {
    setLoadingDocs(true);
    try {
      const res = await doctorService.getAllDoctors({ search, city });
      setDoctors(res.doctors || []);
      if (res.doctors?.length > 0 && !selectedDoctor) {
        setSelectedDoctor(res.doctors[0]);
      }
    } catch (err) {
      console.error('Fetch doctors failed:', err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch slots whenever selectedDoctor or selectedDate changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await appointmentService.getAvailableSlots(selectedDoctor._id, selectedDate);
        setSlots(res.slots || []);
      } catch (err) {
        console.warn('Slots fetch error:', err.message);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setErrorMsg('Please select a doctor, date, and available time slot');
      return;
    }

    setBookingLoading(true);
    setErrorMsg('');

    try {
      await appointmentService.bookAppointment({
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
      });

      setBookingSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Schedule Doctor Consultation
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Pick a certified medical specialist and reserve an available appointment slot.
        </p>
      </div>

      {bookingSuccess ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#ffffff' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Appointment Booked Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Your consultation with Dr. {selectedDoctor?.user?.name} on {formatDate(selectedDate)} at{' '}
            {selectedSlot?.startTime} has been recorded and is pending doctor confirmation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button onClick={() => navigate('/patient/appointments')}>
              Go to My Appointments
            </Button>
            <button
              type="button"
              onClick={() => {
                setBookingSuccess(false);
                setSelectedSlot(null);
                setReason('');
              }}
              className="btn btn-secondary"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="booking-wizard-grid"
        >
          {/* Step 1: Select Doctor */}
          <div className="card" style={{ padding: '1.75rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Step 1: Choose Specialist
            </h3>

            {/* Quick search */}
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Filter doctors by name or specialty..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchDoctors();
                }}
              />
            </div>

            {loadingDocs ? (
              <Loader message="Loading specialists..." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                          Dr. {doc.user?.name || 'Doctor'}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {doc.specialization}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {doc.hospital || 'Clinic'} • {doc.city || 'Chennai'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          {formatCurrency(doc.consultationFee || 500)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
                          ★ {doc.rating ? doc.rating.toFixed(1) : '5.0'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2 & 3: Date, Slot & Confirm */}
          <div className="card" style={{ padding: '1.75rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Step 2: Choose Slot & Book
            </h3>

            {errorMsg && <ErrorMessage message={errorMsg} />}

            <form onSubmit={handleBook}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} /> Select Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Clock size={16} style={{ color: 'var(--secondary)' }} /> Select Available Time
                </label>

                {loadingSlots ? (
                  <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <Loader message="Loading slots..." />
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No slots available on this date.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '0.5rem 0.35rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--primary)' : slot.isAvailable ? '#ffffff' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : slot.isAvailable ? 'var(--text-primary)' : '#94a3b8',
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.8rem',
                            cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                            textAlign: 'center',
                          }}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms / Reason (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your symptoms for the doctor..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>

              {selectedDoctor && selectedSlot && (
                <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><strong>Doctor:</strong> Dr. {selectedDoctor.user?.name}</div>
                  <div><strong>Time:</strong> {formatDate(selectedDate)} at {selectedSlot.startTime}</div>
                  <div><strong>Consultation Fee:</strong> {formatCurrency(selectedDoctor.consultationFee || 500)}</div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={!selectedSlot}
                loading={bookingLoading}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                Confirm Appointment
              </Button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .booking-wizard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
