import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService.js';
import paymentService from '../../services/paymentService.js';
import patientService from '../../services/patientService.js';
import prescriptionService from '../../services/prescriptionService.js';
import AppointmentList from '../../components/patient/AppointmentList.jsx';
import PrescriptionCard from '../../components/patient/PrescriptionCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { CreditCard, Star, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedApptForPayment, setSelectedApptForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApptForReview, setSelectedApptForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Prescription View Modal State
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [viewedPrescription, setViewedPrescription] = useState(null);
  const [presLoading, setPresLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getPatientAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Fetch appointments failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  // Payment Flow
  const handleOpenPayment = (appointment) => {
    navigate(`/patient/checkout/${appointment._id}`);
  };


  // Review Flow
  const handleOpenReview = (appointment) => {
    setSelectedApptForReview(appointment);
    setReviewModalOpen(true);
    setReviewSuccess(false);
    setReviewError('');
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedApptForReview) return;

    setReviewLoading(true);
    setReviewError('');

    try {
      await patientService.createReview({
        appointmentId: selectedApptForReview._id,
        rating,
        comment,
      });
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  // Prescription View Flow
  const handleViewPrescription = async (appointment) => {
    setPrescriptionModalOpen(true);
    setPresLoading(true);
    setViewedPrescription(null);
    try {
      const res = await prescriptionService.getPrescriptionByAppointment(appointment._id);
      setViewedPrescription(res.prescription);
    } catch (err) {
      console.warn('Prescription fetch error:', err.message);
    } finally {
      setPresLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          My Booked Appointments
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Manage your schedule, make consultation fee payments, and view prescriptions.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading your appointments..." />
      ) : (
        <AppointmentList
          appointments={appointments}
          onCancel={handleCancelAppointment}
          onPay={handleOpenPayment}
          onReview={handleOpenReview}
          onViewPrescription={handleViewPrescription}
          userRole="patient"
        />
      )}



      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Consultation"
      >
        {reviewSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={44} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem' }}>Thank You for Your Feedback!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your review has been submitted and doctor ratings updated.
            </p>
            <Button onClick={() => setReviewModalOpen(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview}>
            {reviewError && <ErrorMessage message={reviewError} />}

            <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                Your Rating
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <Star
                      size={32}
                      style={{
                        fill: star <= rating ? '#f59e0b' : '#e2e8f0',
                        color: star <= rating ? '#f59e0b' : '#e2e8f0',
                        transition: 'var(--transition)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review / Feedback</label>
              <textarea
                className="form-textarea"
                placeholder="Share your consultation experience with Dr. ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" loading={reviewLoading}>
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Prescription View Modal */}
      <Modal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        title="Consultation Prescription"
        maxWidth="680px"
      >
        {presLoading ? (
          <Loader message="Fetching prescription details..." />
        ) : viewedPrescription ? (
          <PrescriptionCard prescription={viewedPrescription} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No prescription has been issued yet for this appointment.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyAppointments;
