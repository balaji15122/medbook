import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Building, Award, Calendar, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  const doctorName = doctor.user?.name ? `Dr. ${doctor.user.name}` : 'Doctor';
  const profileImg =
    doctor.profileImage ||
    doctor.user?.profileImage ||
    `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80`;

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#ffffff',
        height: '100%',
      }}
    >
      <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', flex: 1 }}>
        {/* Doctor Avatar */}
        <div style={{ position: 'relative' }}>
          <img
            src={profileImg}
            alt={doctorName}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover',
              border: '2px solid var(--border-color)',
            }}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80';
            }}
          />
          {doctor.isVerified && (
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Verified Specialist"
            >
              <CheckCircle size={20} style={{ color: 'var(--primary)', fill: '#ffffff' }} />
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {doctorName}
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#fef3c7',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#b45309',
              }}
            >
              <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span>{doctor.rating ? doctor.rating.toFixed(1) : 'New'}</span>
              {doctor.totalReviews > 0 && (
                <span style={{ color: '#92400e', fontWeight: 500 }}>
                  ({doctor.totalReviews})
                </span>
              )}
            </div>
          </div>

          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              marginBottom: '0.4rem',
            }}
          >
            {doctor.specialization || 'General Physician'}
          </span>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{doctor.qualification || 'MBBS'} • {doctor.experience || 1}+ yrs exp</span>
            </div>

            {doctor.hospital && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{doctor.hospital}</span>
              </div>
            )}

            {doctor.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{doctor.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA bar */}
      <div
        style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Consultation Fee
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(doctor.consultationFee || 500)}
          </span>
        </div>

        <Link
          to={`/doctors/${doctor._id}`}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Calendar size={14} />
          Book Visit
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
