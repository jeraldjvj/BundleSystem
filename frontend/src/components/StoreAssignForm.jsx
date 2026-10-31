import { useState, useEffect } from 'react';
import { storeService, userService } from '../services/api';

function StoreAssignForm({ store, onSave, onCancel }) {
  const [newUserId, setNewUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      // Excluir al usuario actualmente asignado
      setUsers(response.data.filter(u => u.userId !== store.userId));
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await storeService.updateStore(store.storeCode, { user_id: parseInt(newUserId) });
      setSuccess('Tienda asignada exitosamente!');
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al asignar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#333',
    colorScheme: 'light'
  };

  const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' };

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', padding: '1.5rem 2rem', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Asignar Tienda</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          Cambia el propietario de esta tienda
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {success && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', padding: '0.5rem 1.25rem', backgroundColor: '#f8f9fb', borderRadius: '10px', border: '1px solid #eee' }}>
          <div style={infoRow}><span style={{ color: '#888' }}>Código</span><strong style={{ color: '#1a2340' }}>{store.storeCode}</strong></div>
          <div style={infoRow}><span style={{ color: '#888' }}>Tienda</span><strong style={{ color: '#1a2340' }}>{store.storeName}</strong></div>
          <div style={infoRow}><span style={{ color: '#888' }}>Ciudad</span><strong style={{ color: '#1a2340' }}>{store.city || '-'}</strong></div>
          <div style={{ ...infoRow, borderBottom: 'none' }}><span style={{ color: '#888' }}>Asignada actualmente a</span><strong style={{ color: '#1a2340' }}>{store.userFullName || store.userEmail || store.userId}</strong></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label htmlFor="user_search" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#444', fontSize: '0.875rem' }}>
              Nuevo Usuario:
            </label>
            <input type="hidden" required value={newUserId} />
            <input
              type="text"
              id="user_search"
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setNewUserId(''); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Busca por nombre o MI ID..."
              required={!newUserId}
              style={inputStyle}
            />
            {showDropdown && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                style={{
                backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
                marginTop: '0.35rem', maxHeight: '190px', overflowY: 'auto', overscrollBehavior: 'contain',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}>
                {users
                  .filter(u => {
                    const q = userSearch.toLowerCase();
                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
                    return !q || fullName.includes(q) || String(u.miId).includes(q) || (u.email || '').toLowerCase().includes(q);
                  })
                  .map(u => {
                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
                    return (
                      <div
                        key={u.userId}
                        onMouseDown={() => {
                          setNewUserId(String(u.userId));
                          setUserSearch(`${fullName} — MI ID: ${u.miId}`);
                          setShowDropdown(false);
                        }}
                        style={{
                          padding: '0.7rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333',
                          backgroundColor: String(newUserId) === String(u.userId) ? '#eef2fb' : 'transparent',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4fc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = String(newUserId) === String(u.userId) ? '#eef2fb' : 'transparent'}
                      >
                        {fullName} — MI ID: {u.miId}
                      </div>
                    );
                  })}
                {users.filter(u => {
                  const q = userSearch.toLowerCase();
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
                  return !q || fullName.includes(q) || String(u.miId).includes(q) || (u.email || '').toLowerCase().includes(q);
                }).length === 0 && (
                  <div style={{ padding: '0.9rem 1rem', color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>
                    Sin resultados
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '0.8rem', border: 'none', borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
                color: 'white', fontSize: '1rem', fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(84,112,198,0.3)'
              }}
            >
              {loading ? 'Asignando...' : 'Asignar Tienda'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '0.8rem', backgroundColor: 'white', color: '#555',
                border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                fontSize: '1rem', fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoreAssignForm;
