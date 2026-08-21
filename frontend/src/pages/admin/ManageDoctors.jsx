import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import DoctorTable from '../../components/admin/DoctorTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import { UserCheck, Search, Filter } from 'lucide-react';

export const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Fetch doctors error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (doctorId, isVerified) => {
    try {
      await adminService.verifyDoctor(doctorId, isVerified);
      fetchDoctors();
    } catch (err) {
      alert(err.message || 'Verification update failed');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    const spec = doc.specialization || '';
    const license = doc.licenseNumber || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      spec.toLowerCase().includes(search.toLowerCase()) ||
      license.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && doc.isVerified) ||
      (statusFilter === 'pending' && !doc.isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Doctor Verification & Credentials
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Verify practitioner licenses, qualifications, and authorize doctors to accept patient visits.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by doctor name, specialty, or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="all">All Verification Status</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading doctor directory..." />
      ) : (
        <DoctorTable doctors={filteredDoctors} onVerify={handleVerify} />
      )}
    </div>
  );
};

export default ManageDoctors;
