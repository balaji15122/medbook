import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Search,
  ShieldCheck,
  Calendar,
  Clock,
  Star,
  Users,
  Award,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import DoctorSearch from '../../components/patient/DoctorSearch.jsx';
import DoctorCard from '../../components/patient/DoctorCard.jsx';
import doctorService from '../../services/doctorService.js';
import Loader from '../../components/common/Loader.jsx';

const SPECIALTIES = [
  { name: 'Cardiology', icon: '❤️', count: '30+ Doctors', desc: 'Heart & cardiovascular care' },
  { name: 'Dermatology', icon: '✨', count: '25+ Doctors', desc: 'Skin, hair & allergy health' },
  { name: 'Neurology', icon: '🧠', count: '18+ Doctors', desc: 'Brain & nervous system' },
  { name: 'Pediatrics', icon: '👶', count: '40+ Doctors', desc: 'Child healthcare & wellness' },
  { name: 'Orthopedic', icon: '🦴', count: '22+ Doctors', desc: 'Bone, joint & muscle care' },
  { name: 'General Physician', icon: '🩺', count: '50+ Doctors', desc: 'Primary & preventative care' },
];

export const Home = () => {
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getAllDoctors({ limit: 4 });
        setTopDoctors(res.doctors || []);
      } catch (err) {
        console.warn('Could not fetch top doctors:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 5rem',
          background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 45%), radial-gradient(circle at bottom left, rgba(13, 148, 136, 0.1), transparent 40%), #ffffff',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={16} /> 100% Certified Healthcare Providers
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-1px',
                  marginBottom: '1.25rem',
                  color: 'var(--text-primary)',
                }}
              >
                Find & Book Top Doctors in Your City
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '540px',
                }}
              >
                Connect with licensed medical specialists, view real-time availability slots, book verified appointments, and manage prescriptions digitally.
              </p>

              {/* Integrated Doctor Search */}
              <DoctorSearch
                search={search}
                setSearch={setSearch}
                city={city}
                setCity={setCity}
                onSearch={handleSearch}
              />

              {/* Quick stats pills */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.75rem',
                  marginTop: '2.5rem',
                  paddingTop: '1.75rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                    500+
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Verified Doctors
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                    25k+
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Happy Patients
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--warning)' }}>
                    4.9 ★
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Average Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '480px',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80"
                  alt="Doctor with patient"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />

                {/* Floating Floating Stat Badge */}
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--success)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.15rem' }}>Instant Slot Booking</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      No waiting queues. Guaranteed confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
              Explore By Specialty
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>
              Top Healthcare Departments
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
              Find the right medical expert tailored for your specific symptoms
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {SPECIALTIES.map((spec) => (
              <Link
                key={spec.name}
                to={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                className="card card-interactive"
                style={{
                  padding: '1.75rem 1.5rem',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{spec.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{spec.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{spec.desc}</p>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginTop: '0.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {spec.count} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ padding: '5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-secondary" style={{ marginBottom: '0.5rem' }}>
                Featured Specialists
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
                Top-Rated Doctors Available Today
              </h2>
            </div>

            <Link
              to="/doctors"
              className="btn btn-outline"
              style={{ gap: '0.4rem', fontWeight: 700 }}
            >
              Browse All Doctors <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading featured doctors..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {topDoctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works Section */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-dark)', color: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(37, 99, 235, 0.2)',
                color: '#60a5fa',
                marginBottom: '0.5rem',
                border: '1px solid #1d4ed8',
              }}
            >
              Simple Process
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0 0.5rem' }}>
              How MedBook Works in 4 Easy Steps
            </h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              From discovering top medical experts to getting verified prescriptions
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { step: '01', title: 'Find Doctor', desc: 'Search by specialty, location, fee range, or verified doctor rating.' },
              { step: '02', title: 'Pick Live Slot', desc: 'Select a suitable date and an available 30-min consultation slot.' },
              { step: '03', title: 'Attend Visit', desc: 'Consult with your doctor at the hospital or clinic at your scheduled time.' },
              { step: '04', title: 'Access Rx & Records', desc: 'Receive digital prescriptions, dosages, and medical reports online.' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  padding: '2rem',
                  background: '#1e293b',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #334155',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#3b82f6',
                    opacity: 0.6,
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
