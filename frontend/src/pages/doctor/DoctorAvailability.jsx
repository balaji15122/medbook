import React, { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService.js';
import AvailabilityForm from '../../components/doctor/AvailabilityForm.jsx';
import Loader from '../../components/common/Loader.jsx';
import { CheckCircle2 } from 'lucide-react';

export const DoctorAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getMyAvailability();
      setAvailability(res.availability || []);
    } catch (err) {
      console.error('Fetch availability failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSaveSchedules = async (schedules) => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await doctorService.bulkSetAvailability(schedules);
      setSuccessMsg('Your weekly consultation schedule has been saved successfully!');
      fetchAvailability();
    } catch (err) {
      alert(err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Doctor Working Hours & Availability
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Control which days you are available for patient consultations and set appointment slot durations.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '1rem',
            background: 'var(--success-light)',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <Loader message="Loading working schedules..." />
      ) : (
        <AvailabilityForm
          existingAvailability={availability}
          onSave={handleSaveSchedules}
          loading={saving}
        />
      )}
    </div>
  );
};

export default DoctorAvailability;
