import { useState, useEffect } from 'react';
import { distributorService } from '../services/api';

function DistributorList({ onEdit, onRefresh }) {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDistributors();
  }, [onRefresh]);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const response = await distributorService.getDistributors();
      setDistributors(response.data);
    } catch (err) {
      setError('Error al cargar distribuidores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (distributorId) => {
    if (!window.confirm('¿Estás seguro de eliminar este distribuidor?')) return;

    try {
      await distributorService.deleteDistributor(distributorId);
      loadDistributors();
    } catch (err) {
      setError('Error al eliminar distribuidor: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>Distribuidores</h2>

      {distributors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No hay distribuidores registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', tableLayout: 'auto', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nombre</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((distributor) => (
                <tr key={distributor.distributorId} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem', color: '#333' }}>{distributor.distributorId}</td>
                  <td style={{ padding: '1rem', color: '#333' }}>{distributor.distributorName}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => onEdit(distributor)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px'
                      }}
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3L18.5 2.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(distributor.distributorId)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px'
                      }}
                      title="Eliminar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
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

export default DistributorList;
