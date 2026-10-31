import { useState, useEffect } from 'react';
import { distributorService } from '../services/api';

function DistributorList({ onEdit, onRefresh, onCreate }) {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await distributorService.deleteDistributor(deletingItem.distributorId);
      setDeletingItem(null);
      loadDistributors();
    } catch (err) {
      setError('Error al eliminar distribuidor: ' + err.message);
      setDeletingItem(null);
    } finally {
      setDeleting(false);
    }
  };

  const thStyle = { padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' };
  const tdStyle = { padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' };
  const actionBtn = {
    padding: '0.4rem', borderRadius: '8px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginRight: '0.4rem', border: '1px solid', backgroundColor: 'transparent'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '10px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2340', fontSize: '1.4rem' }}>Gestión de Distribuidores</h2>
          <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{distributors.length} distribuidor(es) registrados</p>
        </div>
        <button onClick={onCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.15rem', background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(84,112,198,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Distribuidor
        </button>
      </div>

      {distributors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No hay distribuidores registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: '500px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nombre</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((distributor) => (
                <tr key={distributor.distributorId} style={{ borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ ...tdStyle, color: '#1a2340', fontWeight: 600 }}>{distributor.distributorId}</td>
                  <td style={tdStyle}>{distributor.distributorName}</td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button onClick={() => onEdit(distributor)} title="Editar" style={{ ...actionBtn, color: '#007bff', borderColor: '#007bff' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3L18.5 2.5z"></path></svg>
                    </button>
                    <button onClick={() => setDeletingItem(distributor)} title="Eliminar" style={{ ...actionBtn, color: '#dc3545', borderColor: '#dc3545', marginRight: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingItem && (
        <div
          onClick={() => !deleting && setDeletingItem(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '2rem',
              maxWidth: '380px', width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1rem',
              backgroundColor: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Eliminar distribuidor?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a eliminar <strong>{deletingItem.distributorName}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeletingItem(null)} disabled={deleting} style={{ flex: 1, padding: '0.7rem', backgroundColor: 'white', color: '#555', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px', backgroundColor: '#dc3545', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistributorList;
