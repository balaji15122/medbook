import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService.js';
import prescriptionService from '../../services/prescriptionService.js';
import PrescriptionForm from '../../components/doctor/PrescriptionForm.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { CheckCircle2, Pill, User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const CreatePrescription = () => {
  const [searchParams] = useSearchParams();
  const appointmentIdFromUrl = searchParams.get('appointmentId');

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getDoctorAppointments();
        const eligible = (res.appointments || []).filter((a) =>
          ['confirmed', 'completed'].includes(a.status)
        );
        setAppointments(eligible);

        if (appointmentIdFromUrl) {
          const matched = eligible.find((a) => a._id === appointmentIdFromUrl);
          if (matched) setSelectedAppt(matched);
        } else if (eligible.length > 0) {
          setSelectedAppt(eligible[0]);
        }
      } catch (err) {
        console.error('Fetch eligible appointments failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [appointmentIdFromUrl]);

  const handleSubmitPrescription = async (prescriptionData) => {
    if (!selectedAppt) {
      setErrorMsg('Please select a patient appointment');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await prescriptionService.createPrescription({
        ...prescriptionData,
        appointmentId: selectedAppt._id,
        patientId: selectedAppt.patient?._id,
      });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading appointment list..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Issue Digital Prescription (Rx)
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Generate certified digital prescriptions with medicine dosages, frequency, and instructions.
        </p>
      </div>

      {success ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <CheckCircle2 size={52} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Prescription Issued Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            The prescription has been added to the patient's EHR and they can download it directly from their portal.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
              }}
              className="btn btn-primary"
            >
              Write Another Prescription
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <Pill size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: 0 }}>No Confirmed Appointments Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            You can write prescriptions for patients with confirmed or completed appointments.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {errorMsg && <ErrorMessage message={errorMsg} />}

          {/* Appointment Selector */}
          <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Select Patient Consultation
            </label>
            <select
              className="form-select"
              value={selectedAppt?._id || ''}
              onChange={(e) => {
                const found = appointments.find((a) => a._id === e.target.value);
                setSelectedAppt(found);
              }}
            >
              {appointments.map((appt) => (
                <option key={appt._id} value={appt._id}>
                  {appt.patient?.user?.name || 'Patient'} ({appt.patient?.gender || 'N/A'}, {appt.patient?.bloodGroup || 'Blood Group N/A'}) — {formatDate(appt.appointmentDate)} at {appt.startTime}
                </option>
              ))}
            </select>
          </div>

          {/* Prescription Form Component */}
          {selectedAppt && (
            <PrescriptionForm
              appointment={selectedAppt}
              onSubmit={handleSubmitPrescription}
              loading={submitting}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePrescription;
