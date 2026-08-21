import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const SPECIALTIES = [
  'All Specialties',
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Gynecologist',
  'ENT Specialist',
  'Dentist',
  'Ophthalmologist',
];

export const DoctorFilter = ({
  specialization,
  setSpecialization,
  minFee,
  setMinFee,
  maxFee,
  setMaxFee,
  onReset,
}) => {
  return (
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <span>Filters</span>
        </div>

        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Specialty Filter */}
      <div className="form-group">
        <label className="form-label">Specialization</label>
        <select
          className="form-select"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value === 'All Specialties' ? '' : e.target.value)}
        >
          {SPECIALTIES.map((spec) => (
            <option key={spec} value={spec === 'All Specialties' ? '' : spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Fee Range Filter */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Consultation Fee (₹)</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            className="form-input"
            value={minFee}
            onChange={(e) => setMinFee(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="number"
            placeholder="Max"
            className="form-input"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorFilter;
