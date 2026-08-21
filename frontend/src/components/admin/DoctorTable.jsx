import React from 'react';
import { CheckCircle2, XCircle, Award, Building, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const DoctorTable = ({ doctors = [], onVerify }) => {
  return (
    <div className="card" style={{ overflow: 'hidden', background: '#ffffff' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Doctor</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Specialization</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>License No.</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Fee</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Verification</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No doctor records found
                </td>
              </tr>
            ) : (
              doctors.map((doc) => (
                <tr
                  key={doc._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}
                >
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'var(--secondary-light)',
                          color: 'var(--secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {doc.user?.name?.charAt(0).toUpperCase() || 'D'}
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                          Dr. {doc.user?.name || 'Doctor'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.qualification || 'MBBS'} ({doc.experience || 1} yrs exp)
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {doc.specialization || 'General Physician'}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {doc.licenseNumber}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                    {formatCurrency(doc.consultationFee || 500)}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {doc.isVerified ? (
                      <span className="badge badge-success" style={{ gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pending Review</span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    {onVerify && (
                      <button
                        type="button"
                        onClick={() => onVerify(doc._id, !doc.isVerified)}
                        className={`btn btn-${doc.isVerified ? 'danger' : 'success'} btn-sm`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {doc.isVerified ? 'Revoke' : 'Approve & Verify'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorTable;
