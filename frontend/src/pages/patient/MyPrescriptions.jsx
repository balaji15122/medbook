import React, { useState, useEffect } from 'react';
import prescriptionService from '../../services/prescriptionService.js';
import PrescriptionCard from '../../components/patient/PrescriptionCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Pill, AlertCircle } from 'lucide-react';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await prescriptionService.getMyPrescriptions();
        setPrescriptions(res.prescriptions || []);
      } catch (err) {
        console.error('Fetch prescriptions failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          My Digital Prescriptions
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          View medicine names, dosage frequencies, durations, and doctor advice.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading your prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Pill size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0 }}>No Prescriptions Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '420px' }}>
            Any digital prescription issued by your consulting doctor will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {prescriptions.map((pres) => (
            <PrescriptionCard key={pres._id} prescription={pres} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;
