import React from 'react';
import { User, Phone, MapPin, Droplet, AlertTriangle, FileText } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const PatientCard = ({ patient, onViewHistory }) => {
  if (!patient) return null;

  const patientName = patient.user?.name || 'Patient';
  const email = patient.user?.email || '';
  const profileImg =
    patient.profileImage ||
    patient.user?.profileImage ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`;

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src={profileImg}
          alt={patientName}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--border-color)',
          }}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
          }}
        />

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{patientName}</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{email}</span>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
            {patient.gender && (
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                {patient.gender}
              </span>
            )}
            {patient.bloodGroup && (
              <span className="badge badge-danger">
                <Droplet size={11} />
                {patient.bloodGroup}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.5rem',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-subtle)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {patient.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{patient.city}</span>
          </div>
        )}
        {patient.dateOfBirth && (
          <div>
            <span>DOB: {formatDate(patient.dateOfBirth)}</span>
          </div>
        )}
      </div>

      {/* Allergies / Chronic Conditions Alerts */}
      {((patient.allergies && patient.allergies.length > 0) ||
        (patient.chronicConditions && patient.chronicConditions.length > 0)) && (
        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {patient.allergies?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)' }}>
              <AlertTriangle size={13} />
              <span><strong>Allergies:</strong> {patient.allergies.join(', ')}</span>
            </div>
          )}
          {patient.chronicConditions?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--warning)' }}>
              <AlertTriangle size={13} />
              <span><strong>Conditions:</strong> {patient.chronicConditions.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {onViewHistory && (
        <button
          type="button"
          onClick={() => onViewHistory(patient)}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', gap: '0.4rem' }}
        >
          <FileText size={14} />
          View Complete Medical History
        </button>
      )}
    </div>
  );
};

export default PatientCard;
