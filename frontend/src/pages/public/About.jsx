import React from 'react';
import { HeartPulse, ShieldCheck, Award, Users, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            About MedBook
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
            Empowering Modern Healthcare Delivery
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            MedBook is a comprehensive healthcare platform connecting patients with certified medical professionals, providing frictionless appointment booking and digital clinical records.
          </p>
        </div>

        {/* Mission Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}
        >
          <div className="card" style={{ padding: '2.5rem', background: '#ffffff' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <HeartPulse size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              To bridge the gap between quality healthcare providers and patients through intuitive technology, instant slot scheduling, and secure digital records.
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem', background: '#ffffff' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Strict Doctor Auditing</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Every doctor listed on MedBook undergoes manual verification of their medical license number, qualifications, and hospital affiliations by our medical board.
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem', background: '#ffffff' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Paperless Healthcare</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Say goodbye to lost paper prescriptions. Patients and doctors can access diagnosis history, medicine dosage reminders, and medical records anytime, anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
