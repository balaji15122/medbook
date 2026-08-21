import React, { useState } from 'react';
import { Plus, Trash2, Pill, Save, Calendar } from 'lucide-react';
import Button from '../common/Button.jsx';

export const PrescriptionForm = ({ appointment, onSubmit, loading = false }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after food' },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((med, idx) => (idx === index ? { ...med, [field]: value } : med))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validMedicines = medicines.filter((m) => m.name.trim());
    if (validMedicines.length === 0) {
      alert('Please add at least one valid medicine with a name');
      return;
    }

    if (onSubmit) {
      onSubmit({
        appointmentId: appointment?._id,
        patientId: appointment?.patient?._id,
        diagnosis,
        medicines: validMedicines,
        additionalInstructions,
        followUpDate: followUpDate || null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '1.75rem', background: '#ffffff' }}>
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Patient Prescription</h3>
        {appointment && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Patient: <strong>{appointment.patient?.user?.name || 'Patient'}</strong> | Appt Date:{' '}
            {new Date(appointment.appointmentDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Diagnosis Field */}
      <div className="form-group">
        <label className="form-label">Diagnosis / Clinical Finding *</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Acute Viral Bronchitis, Hypertension Stage 1"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />
      </div>

      {/* Medicines Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Pill size={16} style={{ color: 'var(--primary)' }} /> Prescribed Medicines *
          </label>
          <button
            type="button"
            onClick={handleAddMedicine}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.3rem 0.65rem', gap: '0.3rem' }}
          >
            <Plus size={14} /> Add Medicine
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {medicines.map((med, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1.5fr 1fr 2fr auto',
                gap: '0.5rem',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
              className="medicine-row"
            >
              <input
                type="text"
                placeholder="Medicine name (e.g. Paracetamol)"
                className="form-input"
                value={med.name}
                onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                required
              />
              <input
                type="text"
                placeholder="Dosage (500mg)"
                className="form-input"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                required
              />
              <select
                className="form-select"
                value={med.frequency}
                onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value="Once daily">Once daily (1-0-0)</option>
                <option value="Twice daily">Twice daily (1-0-1)</option>
                <option value="Thrice daily">Thrice daily (1-1-1)</option>
                <option value="Every 4 hours">Every 4 hours</option>
                <option value="As needed (SOS)">As needed (SOS)</option>
              </select>
              <input
                type="text"
                placeholder="Duration (5 days)"
                className="form-input"
                value={med.duration}
                onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                required
              />
              <input
                type="text"
                placeholder="Instructions (e.g. after meals)"
                className="form-input"
                value={med.instructions}
                onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveMedicine(idx)}
                disabled={medicines.length === 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: medicines.length === 1 ? 'var(--text-muted)' : 'var(--danger)',
                  cursor: medicines.length === 1 ? 'not-allowed' : 'pointer',
                  padding: '0.4rem',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Instructions & Follow up */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Lifestyle / Diet Advice</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Drink plenty of water, avoid spicy food"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Follow-up Review Date</label>
          <input
            type="date"
            className="form-input"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" loading={loading} icon={Save}>
          Issue Prescription
        </Button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .medicine-row {
            gridTemplateColumns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
};

export default PrescriptionForm;
