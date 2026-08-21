import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { formatRelativeTime } from '../../utils/formatDate.js';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const userRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
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
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
              }}
            >
              Med<span style={{ color: 'var(--primary)' }}>Book</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginTop: '-3px',
              }}
            >
              Healthcare Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          <NavLink
            to="/"
            style={({ isActive }) => ({
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/doctors"
            style={({ isActive }) => ({
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            })}
          >
            Find Doctors
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            })}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            style={({ isActive }) => ({
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            })}
          >
            Contact
          </NavLink>
        </nav>

        {/* Right Section Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: notifDropdownOpen ? 'var(--primary-light)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: notifDropdownOpen ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'var(--transition)',
                  }}
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: 'var(--danger)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div
                    className="card animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      width: '340px',
                      maxHeight: '440px',
                      boxShadow: 'var(--shadow-xl)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-subtle)',
                      }}
                    >
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>
                        Notifications ({unreadCount})
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
                      {notifications.length === 0 ? (
                        <div
                          style={{
                            padding: '2.5rem 1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                          }}
                        >
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                            }}
                            style={{
                              padding: '0.85rem 1.25rem',
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: n.isRead ? '#ffffff' : 'var(--primary-light)',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {n.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div style={{ position: 'relative' }} ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.85rem 0.4rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: '1.5px solid var(--primary-border)',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left', display: 'none' }} className="user-text-preview">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span
                      className={`badge badge-${
                        user?.role === 'admin'
                          ? 'danger'
                          : user?.role === 'doctor'
                          ? 'secondary'
                          : 'primary'
                      }`}
                      style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {/* Profile Menu Dropdown */}
                {userDropdownOpen && (
                  <div
                    className="card animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '230px',
                      boxShadow: 'var(--shadow-xl)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      zIndex: 1000,
                      padding: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid var(--border-color)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {user?.email}
                      </div>
                      <div style={{ marginTop: '0.35rem' }}>
                        <span
                          className={`badge badge-${
                            user?.role === 'admin'
                              ? 'danger'
                              : user?.role === 'doctor'
                              ? 'secondary'
                              : 'primary'
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Calendar size={16} style={{ color: 'var(--primary)' }} />
                      Dashboard
                    </Link>

                    {user?.role === 'patient' && (
                      <Link
                        to="/patient/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <User size={16} style={{ color: 'var(--secondary)' }} />
                        Medical Profile
                      </Link>
                    )}

                    {user?.role === 'doctor' && (
                      <Link
                        to="/doctor/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Settings size={16} style={{ color: 'var(--secondary)' }} />
                        Doctor Settings
                      </Link>
                    )}

                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        marginTop: '0.35rem',
                        paddingTop: '0.35rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--danger)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--danger-light)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '0.4rem',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            background: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0' }}
          >
            Home
          </NavLink>
          <NavLink
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0' }}
          >
            Find Doctors
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0' }}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem 0' }}
          >
            Contact
          </NavLink>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .user-text-preview { display: block !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
