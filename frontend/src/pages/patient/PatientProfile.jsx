import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService.js';
import authService from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { User, Phone, MapPin, Droplet, Heart, Shield, Lock, Save, CheckCircle2 } from 'lucide-react';

export const PatientProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    phone: '',
    address: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: '',
    allergies: '',
    chronicConditions: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await patientService.getMyProfile();
        const p = res.patient;
        if (p) {
          setFormData({
            name: p.user?.name || user?.name || '',
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
            gender: p.gender || 'male',
            bloodGroup: p.bloodGroup || 'O+',
            phone: p.phone || '',
            address: p.address || '',
            city: p.city || '',
            emergencyContactName: p.emergencyContact?.name || '',
            emergencyContactPhone: p.emergencyContact?.phone || '',
            emergencyContactRel: p.emergencyContact?.relationship || '',
            allergies: p.allergies?.join(', ') || '',
            chronicConditions: p.chronicConditions?.join(', ') || '',
          });
        }
      } catch (err) {
        console.warn('Profile fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRel,
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions
          ? formData.chronicConditions.split(',').map((s) => s.trim())
          : [],
      };

      await patientService.updateMyProfile(payload);
      updateUserProfile({ name: formData.name });
      setSuccessMsg('Medical profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setPwLoading(true);
    setPwSuccess('');
    setPwError('');

    try {
      await authService.updatePassword({ currentPassword, newPassword });
      setPwSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          My Medical & Personal Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Keep your medical records, allergies, and emergency contacts up to date for doctors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'flex-start' }} className="profile-grid">
        {/* Main Profile Form */}
        <form onSubmit={handleProfileSubmit} className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Personal & Medical Details</h3>

          {successMsg && (
            <div style={{ padding: '0.85rem 1rem', background: 'var(--success-light)', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && <ErrorMessage message={errorMsg} />}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="bloodGroup" className="form-select" value={formData.bloodGroup} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Emergency Contact</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-input"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  name="emergencyContactPhone"
                  className="form-input"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRel"
                  className="form-input"
                  placeholder="e.g. Spouse, Parent"
                  value={formData.emergencyContactRel}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Allergies & Conditions</h4>
            <div className="form-group">
              <label className="form-label">Allergies (comma separated)</label>
              <input
                type="text"
                name="allergies"
                className="form-input"
                placeholder="e.g. Penicillin, Peanuts, Dust"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Chronic Conditions (comma separated)</label>
              <input
                type="text"
                name="chronicConditions"
                className="form-input"
                placeholder="e.g. Asthma, Hypertension, Diabetes Type 2"
                value={formData.chronicConditions}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>

        {/* Security / Password Card */}
        <form onSubmit={handlePasswordSubmit} className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Security Settings</h3>
          </div>

          {pwSuccess && (
            <div style={{ padding: '0.75rem', background: 'var(--success-light)', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {pwSuccess}
            </div>
          )}

          {pwError && <ErrorMessage message={pwError} />}

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" variant="secondary" loading={pwLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Update Password
          </Button>
        </form>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default PatientProfile;
