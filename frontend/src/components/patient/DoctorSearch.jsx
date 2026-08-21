import React from 'react';
import { Search, MapPin } from 'lucide-react';

export const DoctorSearch = ({
  search,
  setSearch,
  city,
  setCity,
  onSearch,
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel ${className}`}
      style={{
        padding: '0.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        background: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Search Input */}
      <div
        style={{
          flex: '1 1 240px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by doctor name, specialty, hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '0.925rem',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* City Input */}
      <div
        style={{
          flex: '0 1 180px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Location / City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '0.925rem',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
        Find Doctors
      </button>
    </form>
  );
};

export default DoctorSearch;
