import { useState, useEffect } from 'react';
import { bundleService, userService } from '../services/api';

function BundleAssignForm({ bundle, onSave, onCancel }) {
  const [newUserId, setNewUserId] = useState('');
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
      setUsers(response.data.filter(u => u.userId !== bundle.userId));
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
      await bundleService.assignBundle(bundle.bundleId, { new_user_id: parseInt(newUserId) });
      setSuccess('Bundle asignado exitosamente!');
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al asignar el bundle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', width: '100%', boxSizing: 'border-box' }}>
      <h2>Asignar Bundle</h2>

      {success && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Número de Serie:</strong> {bundle.serialNumber}</p>
        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Proyecto:</strong> {bundle.projectName || bundle.projectId}</p>
        <p style={{ margin: '0' }}><strong>Asignado actualmente a:</strong> {bundle.userFullName || bundle.userEmail || bundle.userId}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="new_user_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nuevo Usuario: *
          </label>
          <select
            id="new_user_id"
            name="new_user_id"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un usuario</option>
            {users.map(u => {
              const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
              return (
                <option key={u.userId} value={u.userId}>
                  {fullName} — MI ID: {u.miId}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Asignando...' : 'Asignar Bundle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default BundleAssignForm;
