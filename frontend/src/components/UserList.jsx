import { useState, useEffect } from 'react';
import { userService } from '../services/api';

function UserList({ onEdit, onRefresh, onCreate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, [onRefresh]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '10px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2340', fontSize: '1.4rem' }}>Gestión de Usuarios</h2>
          <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{users.length} usuario(s) registrados</p>
        </div>
        <button onClick={onCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.15rem', background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(84,112,198,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Usuario
        </button>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No hay usuarios registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Foto de Perfil</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nombre Completo</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>MI ID</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Email</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nivel</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Ciudad</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Estado</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
              const initials = ((user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
              const photoUrl = user.profilePicture
                ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:3000/uploads/${user.profilePicture}`)
                : null;
              return (
              <tr key={user.userId} style={{ borderBottom: '1px solid #f0f0f0' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={fullName}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dee2e6', display: 'inline-block' }}
                    />
                  ) : (
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%', margin: '0 auto',
                      background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.95rem', border: '2px solid #dee2e6'
                    }}>
                      {initials}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333' }}>{fullName || '-'}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333' }}>{user.miId}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333' }}>{user.email}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333' }}>{user.levelUser}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333' }}>{user.city || '-'}</td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: user.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: user.status === 'active' ? '#155724' : '#721c24',
                    border: `1px solid ${user.status === 'active' ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                  <button
                    onClick={() => onEdit(user)}
                    title="Editar"
                    style={{
                      padding: '0.4rem', backgroundColor: 'transparent', color: '#007bff',
                      border: '1px solid #007bff', borderRadius: '6px', cursor: 'pointer',
                      marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>
                    </svg>
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default UserList;
