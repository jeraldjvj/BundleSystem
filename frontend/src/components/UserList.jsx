import { useState, useEffect } from 'react';
import { userService } from '../services/api';

function UserList({ onEdit, onRefresh }) {
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

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await userService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError('Error al eliminar usuario: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>Usuarios Existentes</h2>

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No hay usuarios registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', tableLayout: 'auto', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>MI ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nombre Completo</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nivel</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem', color: '#333' }}>{user.miId}</td>
                <td style={{ padding: '1rem', color: '#333' }}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}
                </td>
                <td style={{ padding: '1rem', color: '#333' }}>{user.email}</td>
                <td style={{ padding: '1rem', color: '#333' }}>{user.status}</td>
                <td style={{ padding: '1rem', color: '#333' }}>{user.levelUser}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => onEdit(user)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.userId)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default UserList;
