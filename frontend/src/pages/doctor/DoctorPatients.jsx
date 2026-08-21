import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService.js';
import doctorService from '../../services/doctorService.js';
import PatientCard from '../../components/doctor/PatientCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Users, Search, FileText, Pill, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Patient History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await patientService.getAllPatients();
        setPatients(res.patients || []);
      } catch (err) {
        console.error('Fetch patients failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    setPatientHistory(null);

    try {
      const res = await patientService.getPatientHistory(patient._id);
      setPatientHistory(res.history);
    } catch (err) {
      console.error('Fetch patient history failed:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = p.user?.name || '';
    const email = p.user?.email || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Registered Patients Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Search patient medical profiles, allergies, chronic conditions, and past treatment histories.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by patient name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Loading patient database..." />
      ) : filteredPatients.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <Users size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: 0 }}>No Patients Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Try searching for a different name or location.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Patient History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Medical History: ${selectedPatient?.user?.name || 'Patient'}`}
        maxWidth="750px"
      >
        {loadingHistory ? (
          <Loader message="Loading complete clinical history..." />
        ) : patientHistory ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary details */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                background: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              <div><strong>Blood Group:</strong> {selectedPatient?.bloodGroup || 'Not specified'}</div>
              <div><strong>Gender:</strong> {selectedPatient?.gender || 'N/A'}</div>
              <div><strong>Allergies:</strong> {selectedPatient?.allergies?.join(', ') || 'None recorded'}</div>
              <div><strong>Chronic Conditions:</strong> {selectedPatient?.chronicConditions?.join(', ') || 'None'}</div>
            </div>

            {/* Prescriptions History */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Pill size={16} style={{ color: 'var(--primary)' }} /> Past Prescriptions ({patientHistory.prescriptions?.length || 0})
              </h4>
              {patientHistory.prescriptions?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No previous prescriptions found</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {patientHistory.prescriptions.map((p) => (
                    <div key={p._id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{p.diagnosis || 'Prescription'}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(p.prescriptionDate)}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Medicines: {p.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Records History */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={16} style={{ color: 'var(--secondary)' }} /> Medical Records ({patientHistory.medicalRecords?.length || 0})
              </h4>
              {patientHistory.medicalRecords?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No medical records on file</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {patientHistory.medicalRecords.map((r) => (
                    <div key={r._id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{r.diagnosis}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(r.recordDate)}</span>
                      </div>
                      {r.symptoms && <div>Symptoms: {r.symptoms}</div>}
                      {r.treatment && <div>Treatment: {r.treatment}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No history available for this patient.</p>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
