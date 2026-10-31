import { useState, useEffect } from 'react';
import { storeService } from '../services/api';

function StoreList({ onEdit, onCreate, onImport, onBatchImport, onAssign }) {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingStore, setDeletingStore] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const columns = [
    { key: 'storeCode', label: 'Código', value: s => s.storeCode },
    { key: 'storeName', label: 'Nombre', value: s => s.storeName },
    { key: 'userName', label: 'Nombre de Usuario', value: s => s.userFullName || s.userEmail || '' },
    { key: 'city', label: 'Ciudad', value: s => s.city || '' },
  ];

  const filteredStores = stores.filter(s =>
    columns.every(c => {
      const f = (filters[c.key] || '').toLowerCase();
      if (!f) return true;
      return String(c.value(s) ?? '').toLowerCase().includes(f);
    })
  );

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storeService.getStores();
      setStores(response.data);
    } catch (err) {
      setError('Error al cargar tiendas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await storeService.deleteStore(deletingStore.storeCode);
      setDeletingStore(null);
      loadStores();
    } catch (err) {
      setError('Error al eliminar tienda: ' + err.message);
      setDeletingStore(null);
    } finally {
      setDeleting(false);
    }
  };

  const headerBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1.15rem', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 600
  };

  const actionBtn = {
    padding: '0.4rem', borderRadius: '8px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginRight: '0.4rem', border: '1px solid'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2340', fontSize: '1.4rem' }}>Tiendas</h2>
          <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{filteredStores.length} de {stores.length} tienda(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={onBatchImport} style={{ ...headerBtn, backgroundColor: '#eef2fb', color: '#2d3f6e', border: '1px solid #c7d3f0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/><path d="M16 21h5v-5"/><path d="M8 21H3v-5"/>
            </svg>
            Reasignar Tienda desde Excel
          </button>
          <button onClick={onImport} style={{ ...headerBtn, backgroundColor: '#eef2fb', color: '#2d3f6e', border: '1px solid #c7d3f0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Crear Tienda desde Excel
          </button>
          <button onClick={onCreate} style={{ ...headerBtn, background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(84,112,198,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Crear Una Tienda
          </button>
        </div>
      </div>

      {stores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No hay tiendas registradas
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: '700px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{col.label}</span>
                    <button
                      onClick={() => setActiveFilter(activeFilter === col.key ? null : col.key)}
                      style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: filters[col.key] ? '#5470c6' : '#6c757d' }}
                      title={`Buscar en ${col.label}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                  {activeFilter === col.key && (
                    <input
                      type="text"
                      autoFocus
                      placeholder={`Buscar ${col.label}...`}
                      value={filters[col.key] || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.35rem 0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'normal', boxSizing: 'border-box', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none' }}
                    />
                  )}
                </th>
              ))}
              <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map((store) => (
              <tr key={store.storeCode} style={{ borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.85rem 1.25rem', color: '#1a2340', fontWeight: 600, fontSize: '0.9rem' }}>{store.storeCode}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>{store.storeName}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>{store.userFullName || store.userEmail || '-'}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>{store.city || '-'}</td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => onAssign(store)}
                    title="Asignar Tienda"
                    style={{ ...actionBtn, color: '#17a2b8', borderColor: '#17a2b8', backgroundColor: 'transparent' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5" cy="5.5" r="2.5"></circle>
                      <path d="M1.2 18c0-3.5 1.7-5.2 3.8-5.2s3.8 1.7 3.8 5.2"></path>
                      <circle cx="19" cy="5.5" r="2.5"></circle>
                      <path d="M15.2 18c0-3.5 1.7-5.2 3.8-5.2s3.8 1.7 3.8 5.2"></path>
                      <path d="M10 10.5h4"></path>
                      <path d="M12.5 9l1.7 1.5-1.7 1.5"></path>
                      <path d="M14 14.5h-4"></path>
                      <path d="M11.5 13l-1.7 1.5 1.7 1.5"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(store)}
                    title="Editar"
                    style={{ ...actionBtn, color: '#007bff', borderColor: '#007bff', backgroundColor: 'transparent' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3L18.5 2.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingStore(store)}
                    title="Eliminar"
                    style={{ ...actionBtn, color: '#dc3545', borderColor: '#dc3545', backgroundColor: 'transparent', marginRight: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No se encontraron resultados con los filtros aplicados
                  </td>
                </tr>
              )}
          </tbody>
        </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingStore && (
        <div
          onClick={() => !deleting && setDeletingStore(null)}
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
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Eliminar tienda?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a eliminar <strong>{deletingStore.storeName}</strong> ({deletingStore.storeCode}). Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingStore(null)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '0.7rem', backgroundColor: 'white', color: '#555',
                  border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px',
                  backgroundColor: '#dc3545', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreList;
