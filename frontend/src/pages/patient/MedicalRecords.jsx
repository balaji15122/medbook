import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService.js';
import MedicalRecordCard from '../../components/patient/MedicalRecordCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import { FileText, FolderOpen } from 'lucide-react';

export const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await patientService.getMyMedicalRecords();
        setRecords(res.medicalRecords || []);
      } catch (err) {
        console.error('Fetch records failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          My Electronic Health Records (EHR)
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          View clinical notes, diagnoses, symptoms, and attached laboratory reports.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading medical records..." />
      ) : records.length === 0 ? (
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
          <FolderOpen size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0 }}>No Medical Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '420px' }}>
            When your consulting doctors record clinical diagnoses or attach lab reports, they will be securely stored here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {records.map((record) => (
            <MedicalRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
