import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: '#94a3b8',
        padding: '4rem 0 2rem',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="container">
        {/* Features banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '3rem',
            marginBottom: '3rem',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(37, 99, 235, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Verified Doctors
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Licensed & background-checked</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(13, 148, 136, 0.15)',
                color: '#2dd4bf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={26} />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Instant Booking
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Real-time available slot picker</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={26} />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Certified Records
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Digital prescriptions & EHR</p>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <HeartPulse size={20} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Med<span style={{ color: '#60a5fa' }}>Book</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Your trusted digital healthcare gateway. Connect with top doctors, book appointments, and manage medical prescriptions with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/doctors" style={{ color: '#94a3b8' }}>Find Doctors</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8' }}>About Us</Link></li>
              <li><Link to="/contact" style={{ color: '#94a3b8' }}>Contact Support</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Doctor Sign In</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Top Specialties
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link to="/doctors?specialization=Cardiology" style={{ color: '#94a3b8' }}>Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Dermatology" style={{ color: '#94a3b8' }}>Dermatology</Link></li>
              <li><Link to="/doctors?specialization=Neurology" style={{ color: '#94a3b8' }}>Neurology</Link></li>
              <li><Link to="/doctors?specialization=Pediatrics" style={{ color: '#94a3b8' }}>Pediatrics</Link></li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Emergency & Help
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <PhoneCall size={16} style={{ color: '#ef4444' }} />
                <span>24/7 Helpline: <strong>+91 1800-MEDBOOK</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={16} style={{ color: '#60a5fa' }} />
                <span>support@medbook.healthcare</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={16} style={{ color: '#2dd4bf' }} />
                <span>Healthcare Tech City, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '2rem',
            borderTop: '1px solid #1e293b',
            fontSize: '0.8rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} MedBook Healthcare Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
