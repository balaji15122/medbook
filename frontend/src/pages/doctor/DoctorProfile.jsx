import React, { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService.js';
import authService from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { Award, Building, MapPin, DollarSign, ShieldCheck, Lock, Save, CheckCircle2, Camera } from 'lucide-react';

export const DoctorProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    specialization: 'General Physician',
    qualification: 'MBBS',
    experience: 5,
    consultationFee: 500,
    hospital: '',
    address: '',
    city: '',
    about: '',
    phone: '',
    profileImage: '',
    isAvailable: true,
  });

  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setLoading(true);
      try {
        const res = await doctorService.getMyDoctorProfile();
        const doc = res.doctor;
        if (doc) {
          setIsVerified(doc.isVerified);
          setFormData({
            name: doc.user?.name || user?.name || '',
            specialization: doc.specialization || 'General Physician',
            qualification: doc.qualification || 'MBBS',
            experience: doc.experience || 1,
            consultationFee: doc.consultationFee || 500,
            hospital: doc.hospital || '',
            address: doc.address || '',
            city: doc.city || '',
            about: doc.about || '',
            phone: doc.phone || '',
            profileImage: doc.profileImage || doc.user?.profileImage || '',
            isAvailable: doc.isAvailable !== false,
          });
        }
      } catch (err) {
        console.warn('Doctor profile fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorProfile();
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.profileImage) {
      setErrorMsg('Please upload your doctor profile photo');
      setSaving(false);
      return;
    }

    try {
      await doctorService.updateDoctorProfile({
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
      });
      updateUserProfile({ name: formData.name, profileImage: formData.profileImage });
      setSuccessMsg('Doctor practice profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update doctor profile');
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
    return <Loader message="Loading doctor profile settings..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Doctor Practice Settings & Credentials
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Manage your clinical bio, consultation fees, hospital affiliations, and active status.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'flex-start' }} className="profile-grid">
        {/* Practice Form */}
        <form onSubmit={handleProfileSubmit} className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Clinical Details</h3>
            {isVerified ? (
              <span className="badge badge-success" style={{ gap: '0.25rem' }}>
                <ShieldCheck size={14} /> Verified Doctor
              </span>
            ) : (
              <span className="badge badge-warning">Verification Pending</span>
            )}
          </div>

          {successMsg && (
            <div style={{ padding: '0.85rem 1rem', background: 'var(--success-light)', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && <ErrorMessage message={errorMsg} />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '92px',
                height: '92px',
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
                <Camera size={30} />
              )}
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <label className="form-label">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handlePhotoChange}
              />
              <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                JPG, PNG, or WEBP. Max 2 MB.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
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
              <label className="form-label">Specialization</label>
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
                <option value="ENT Specialist">ENT Specialist</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                name="qualification"
                className="form-input"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
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
              <label className="form-label">Consultation Fee (₹)</label>
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
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hospital / Clinic Affiliation</label>
            <input
              type="text"
              name="hospital"
              className="form-input"
              value={formData.hospital}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Clinic Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
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
            <label className="form-label">About Dr. / Bio</label>
            <textarea
              name="about"
              className="form-textarea"
              rows={3}
              value={formData.about}
              onChange={handleChange}
            />
          </div>

          {/* Accepting Patients Toggle */}
          <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isAvailable" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              Currently Accepting New Appointments
            </label>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>

        {/* Security Password Card */}
        <form onSubmit={handlePasswordSubmit} className="card" style={{ padding: '2rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={20} style={{ color: 'var(--secondary)' }} />
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

export default DoctorProfile;
