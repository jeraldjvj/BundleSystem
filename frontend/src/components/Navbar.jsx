import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ currentView, onViewChange, canAccessManagement, canAccessBundles, canAccessDelivery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  const handleViewChange = (view) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const iconProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

  const menuItems = [
    { view: 'reports', label: 'Reportes', show: true, icon: <svg {...iconProps}><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg> },
    { view: 'users', label: 'Usuarios', show: canAccessManagement, icon: <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { view: 'stores', label: 'Tiendas', show: canAccessManagement, icon: <svg {...iconProps}><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-7h6v7"/></svg> },
    { view: 'projects', label: 'Proyectos', show: canAccessManagement, icon: <svg {...iconProps}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
    { view: 'bundleModels', label: 'Modelos de Bandeo', show: canAccessManagement, icon: <svg {...iconProps}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
    { view: 'bundles', label: 'Bandeos', show: canAccessBundles, icon: <svg {...iconProps}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { view: 'smartphoneModels', label: 'Modelos de Smartphone', show: canAccessManagement, icon: <svg {...iconProps}><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/><line x1="9" y1="6" x2="15" y2="6"/></svg> },
    { view: 'smartphones', label: 'Smartphones', show: canAccessManagement, icon: <svg {...iconProps}><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/></svg> },
    { view: 'bundleDelivery', label: 'Entrega de Bandeos', show: canAccessDelivery, icon: <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> },
    { view: 'shareBundles', label: 'Compartir Bandeos', show: canAccessDelivery, icon: <svg {...iconProps}><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg> },
    { view: 'receiveBundles', label: 'Recibir Bandeos', show: true, icon: <svg {...iconProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
    { view: 'distributors', label: 'Distribuidores', show: canAccessManagement, icon: <svg {...iconProps}><rect x="1" y="7" width="14" height="10"/><path d="M15 10h4l4 4v3h-8z"/><circle cx="6" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg> }
  ];

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          backgroundColor: '#343a40',
          color: 'white',
          border: 'none',
          padding: '0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <span style={{
          width: '24px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'translateY(7px) rotate(45deg)' : 'none'
        }}></span>
        <span style={{
          width: '24px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          opacity: isOpen ? 0 : 1
        }}></span>
        <span style={{
          width: '24px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'translateY(-7px) rotate(-45deg)' : 'none'
        }}></span>
      </button>

      {/* Profile button */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1001 }}>
        <button
          onClick={toggleProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {user?.profilePicture && !avatarError ? (
              <img
                src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:3000/uploads/${user.profilePicture}`}
                alt="Avatar"
                onError={() => setAvatarError(true)}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user?.firstName, user?.lastName)
            )}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontSize: '0.875rem', 
              fontWeight: 'bold', 
              color: '#333',
              lineHeight: '1.2'
            }}>
              {user?.firstName || user?.email?.split('@')[0]}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666',
              lineHeight: '1.2'
            }}>
              {user?.levelUser || 'User'}
            </div>
          </div>
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            overflow: 'hidden',
            zIndex: 1002
          }}>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                color: '#dc3545',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? '0' : '-280px',
          width: '280px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1a2340 0%, #2d3f6e 100%)',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000,
          boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.35)' : 'none',
          paddingTop: '4rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', padding: '0 1.5rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #5470c6, #73c0de)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(84,112,198,0.5)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2"/>
                <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
              </svg>
            </div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '1.35rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              BundleSystem
            </h2>
          </div>

          <nav style={{ padding: '0 1rem' }}>
            {menuItems.filter(m => m.show).map(item => {
              const active = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleViewChange(item.view)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    backgroundColor: active ? 'rgba(84,112,198,0.35)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.75)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    fontWeight: active ? 'bold' : 'normal',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    transition: 'background-color 0.2s, color 0.2s',
                    borderLeft: active ? '3px solid #73c0de' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ display: 'flex', color: active ? '#73c0de' : 'rgba(255,255,255,0.55)' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>


      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        ></div>
      )}
    </>
  );
}

export default Navbar;
