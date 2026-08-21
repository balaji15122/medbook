import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HeartPulse, User, Mail, Lock, Phone, Building, Award, UserPlus, CheckCircle2, Camera } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    // Doctor specific
    specialization: 'General Physician',
    qualification: 'MBBS',
    experience: '3',
    consultationFee: '500',
    hospital: '',
    licenseNumber: '',
    profileImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please choose a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Profile photo must be smaller than 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      setErrorMsg('');
    };
    reader.onerror = () => setErrorMsg('Could not read selected image');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    if (role === 'doctor' && !formData.profileImage) {
      setErrorMsg('Please upload your doctor profile photo');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        role,
        experience: Number(formData.experience) || 1,
        consultationFee: Number(formData.consultationFee) || 500,
      };

      const res = await register(payload);
      const userRole = res.user?.role || role;

      if (userRole === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: role === 'doctor' ? '680px' : '500px',
          padding: '2.5rem',
          background: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
          transition: 'var(--transition)',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <HeartPulse size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Med<span style={{ color: 'var(--primary)' }}>Book</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem' }}>Create Account</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Join thousands of patients and verified healthcare providers
          </p>
        </div>

        {/* Role Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('patient')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: role === 'patient' ? '#ffffff' : 'transparent',
              color: role === 'patient' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'patient' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)',
            }}
          >
            👤 Patient Account
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: role === 'doctor' ? '#ffffff' : 'transparent',
              color: role === 'doctor' ? 'var(--secondary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'doctor' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)',
            }}
          >
            👨‍⚕️ Doctor / Specialist
          </button>
        </div>

        {errorMsg && <ErrorMessage message={errorMsg} />}

        <form onSubmit={handleSubmit}>
          {/* Base Fields Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: role === 'doctor' ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
              gap: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">{role === 'doctor' ? 'Full Doctor Name *' : 'Full Name *'}</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder={role === 'doctor' ? 'Dr. John Doe' : 'Jane Doe'}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password * (min 6 characters)</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="e.g. Chennai, Bangalore"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            {/* Doctor Extra Fields */}
            {role === 'doctor' && (
              <>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Doctor Profile Photo *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '86px',
                        height: '86px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Doctor profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Camera size={28} />
                      )}
                    </div>
                    <div style={{ flex: '1 1 220px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handlePhotoChange}
                        required={role === 'doctor'}
                      />
                      <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        JPG, PNG, or WEBP. Max 2 MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <select
                    name="specialization"
                    className="form-select"
                    value={formData.specialization}
                    onChange={handleChange}
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Gynecologist">Gynecologist</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Qualification *</label>
                  <input
                    type="text"
                    name="qualification"
                    className="form-input"
                    placeholder="e.g. MBBS, MD, MS"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-input"
                    placeholder="e.g. MED-2024-8849"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience"
                    className="form-input"
                    min={0}
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    className="form-input"
                    min={0}
                    value={formData.consultationFee}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hospital / Clinic Affiliation</label>
                  <input
                    type="text"
                    name="hospital"
                    className="form-input"
                    placeholder="e.g. Apollo Hospital, City Clinic"
                    value={formData.hospital}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={UserPlus}
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
          >
            Complete Registration
          </Button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
