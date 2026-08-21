import React from 'react';
import { FileText, Calendar, Paperclip, Download, User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const MedicalRecordCard = ({ record }) => {
  if (!record) return null;

  const doctorName = record.doctor?.user?.name ? `Dr. ${record.doctor.user.name}` : 'Doctor';

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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
            Medical Diagnosis
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{record.diagnosis}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Recorded by {doctorName} ({record.doctor?.specialization || 'Physician'})
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            background: 'var(--bg-subtle)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Calendar size={14} />
          <span>{formatDate(record.recordDate || record.createdAt)}</span>
        </div>
      </div>

      {record.symptoms && (
        <div style={{ fontSize: '0.875rem' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Symptoms: </strong>
          <span style={{ color: 'var(--text-primary)' }}>{record.symptoms}</span>
        </div>
      )}

      {record.treatment && (
        <div style={{ fontSize: '0.875rem' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Treatment: </strong>
          <span style={{ color: 'var(--text-primary)' }}>{record.treatment}</span>
        </div>
      )}

      {record.notes && (
        <div
          style={{
            fontSize: '0.875rem',
            background: 'var(--bg-subtle)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>Clinical Notes: </strong>
          {record.notes}
        </div>
      )}

      {/* Attachments */}
      {record.attachments && record.attachments.length > 0 && (
        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '0.5rem',
            }}
          >
            <Paperclip size={14} />
            Attachments ({record.attachments.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {record.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url || '#'}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                <FileText size={13} />
                <span>{att.name || 'Report.pdf'}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordCard;
