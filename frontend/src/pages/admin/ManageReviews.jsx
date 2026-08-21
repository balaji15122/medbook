import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';
import Loader from '../../components/common/Loader.jsx';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllReviews();
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Fetch reviews error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await adminService.deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Doctor Reviews Moderation
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Audit patient comments, ratings, and moderate feedback submitted to the platform.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', background: '#ffffff' }}>
          <MessageSquare size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: 0 }}>No Reviews Submitted</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            When patients complete visits and rate doctors, reviews will be listed here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <strong>{rev.patient?.user?.name || 'Patient'}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>reviewed</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Dr. {rev.doctor?.user?.name || 'Doctor'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.1rem', marginLeft: 'auto' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        style={{
                          fill: i < rev.rating ? '#f59e0b' : '#e2e8f0',
                          color: i < rev.rating ? '#f59e0b' : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>
                  "{rev.comment || 'No written comment'}"
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(rev.createdAt)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(rev._id)}
                className="btn btn-danger btn-sm"
                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
              >
                <Trash2 size={14} /> Remove Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
