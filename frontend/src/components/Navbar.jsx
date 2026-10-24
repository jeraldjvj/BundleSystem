import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ currentView, onViewChange, canAccessManagement, canAccessBundles, canAccessDelivery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
          transition: isOpen ? 'transform 0.3s' : 'none'
        }}></span>
        <span style={{
          width: '24px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '2px',
          transition: isOpen ? 'transform 0.3s' : 'none'
        }}></span>
        <span style={{
          width: '24px',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '2px',
          transition: isOpen ? 'transform 0.3s' : 'none'
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
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Avatar" 
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
          backgroundColor: '#343a40',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000,
          boxShadow: isOpen ? '2px 0 8px rgba(0,0,0,0.2)' : 'none',
          paddingTop: '4rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '2rem', 
            padding: '0 1.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold' 
          }}>
            BundleSystem
          </h2>

          <nav style={{ padding: '0 1rem' }}>
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('users')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'users' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Usuarios
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('stores')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'stores' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Stores
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('projects')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'projects' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Proyectos
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('bundleModels')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'bundleModels' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Modelos de Bundle
              </button>
            )}
            {canAccessBundles && (
              <button
                onClick={() => handleViewChange('bundles')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'bundles' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Bundles
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('smartphoneModels')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'smartphoneModels' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Modelos de Smartphone
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('smartphones')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'smartphones' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Smartphones
              </button>
            )}
            {canAccessDelivery && (
              <button
                onClick={() => handleViewChange('bundleDelivery')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'bundleDelivery' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Entrega de Bundles
              </button>
            )}
            {canAccessManagement && (
              <button
                onClick={() => handleViewChange('distributors')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: currentView === 'distributors' ? '#495057' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                Distribuidores
              </button>
            )}
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
