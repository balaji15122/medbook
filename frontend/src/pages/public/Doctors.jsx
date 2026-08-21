import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import doctorService from '../../services/doctorService.js';
import DoctorCard from '../../components/patient/DoctorCard.jsx';
import DoctorSearch from '../../components/patient/DoctorSearch.jsx';
import DoctorFilter from '../../components/patient/DoctorFilter.jsx';
import Loader from '../../components/common/Loader.jsx';
import { UserX, Stethoscope } from 'lucide-react';

export const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getAllDoctors({
        search,
        city,
        specialization,
        minFee,
        maxFee,
      });
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Fetch doctors failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, minFee, maxFee]);

  const handleSearchSubmit = () => {
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setSpecialization('');
    setMinFee('');
    setMaxFee('');
    setSearchParams({});
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Browse Certified Doctors & Specialists
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Choose from over 500+ verified doctors and book your visit instantly
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <DoctorSearch
            search={search}
            setSearch={setSearch}
            city={city}
            setCity={setCity}
            onSearch={handleSearchSubmit}
          />
        </div>

        {/* Content Layout: Sidebar Filter + Doctor Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="doctors-layout"
        >
          {/* Filters Sidebar */}
          <aside>
            <DoctorFilter
              specialization={specialization}
              setSpecialization={setSpecialization}
              minFee={minFee}
              setMinFee={setMinFee}
              maxFee={maxFee}
              setMaxFee={setMaxFee}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Doctors Grid */}
          <div>
            {loading ? (
              <Loader message="Searching verified doctors..." />
            ) : doctors.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <UserX size={48} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ margin: 0 }}>No doctors match your criteria</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '400px' }}>
                  Try adjusting your search terms, removing fee constraints, or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Showing {doctors.length} verified doctors</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {doctors.map((doc) => (
                    <DoctorCard key={doc._id} doctor={doc} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .doctors-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Doctors;
