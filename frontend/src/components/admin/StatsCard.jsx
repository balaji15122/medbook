import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) => {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={28} />}
      </div>

      <div>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.15rem 0 0', color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
