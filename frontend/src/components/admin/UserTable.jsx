import React from 'react';
import { User, Trash2, Power, Shield, Check, X } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export const UserTable = ({ users = [], onToggleStatus, onDelete }) => {
  return (
    <div className="card" style={{ overflow: 'hidden', background: '#ffffff' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>User</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Registered</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}
                >
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{u.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span
                      className={`badge badge-${
                        u.role === 'admin'
                          ? 'danger'
                          : u.role === 'doctor'
                          ? 'secondary'
                          : 'primary'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {u.isActive ? (
                      <span className="badge badge-success" style={{ gap: '0.2rem' }}>
                        <Check size={11} /> Active
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ gap: '0.2rem' }}>
                        <X size={11} /> Inactive
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>
                    {formatDate(u.createdAt)}
                  </td>

                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {onToggleStatus && u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(u._id)}
                          title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Power size={14} style={{ color: u.isActive ? '#eab308' : '#10b981' }} />
                        </button>
                      )}

                      {onDelete && u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => onDelete(u._id)}
                          title="Delete user"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
