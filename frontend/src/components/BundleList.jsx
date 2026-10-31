import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { bundleService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BundleList({ onEdit, onCreate, onImport, onAssign, onRefresh }) {
  const { user } = useAuth();
  const canEditBundles = user?.levelUser === 'Office Manager' || user?.levelUser === 'admin';
  const [bundles, setBundles] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const columns = [
    { key: 'bundleId', label: 'ID', value: b => String(b.bundleId) },
    { key: 'serialNumber', label: 'Número de Serie', value: b => b.serialNumber },
    { key: 'projectName', label: 'Proyecto', value: b => b.projectName || String(b.projectId) },
    { key: 'bundleModelName', label: 'Modelo de Bandeo', value: b => b.bundleModelName || String(b.bundleModelId) },
    { key: 'assignee', label: 'Asignado a', value: b => b.userFullName || b.userEmail || String(b.userId) },
    { key: 'createTime', label: 'Fecha de Creación', value: b => b.createTime ? new Date(b.createTime).toLocaleDateString() : '' },
  ];

  const filteredBundles = bundles.filter(b =>
    columns.every(c => {
      const f = (filters[c.key] || '').toLowerCase();
      if (!f) return true;
      return String(c.value(b) ?? '').toLowerCase().includes(f);
    })
  );

  useEffect(() => {
    loadBundles();
  }, [onRefresh]);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5Qrcode('barcode-scanner', {
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    });
    scannerRef.current = scanner;
    let cancelled = false;

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => ({
          width: Math.floor(viewfinderWidth * 0.9),
          height: Math.floor(viewfinderHeight * 0.4)
        }),
        aspectRatio: 1.7778,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      },
      (decodedText) => {
        setFilters(prev => ({ ...prev, serialNumber: decodedText }));
        setActiveFilter('serialNumber');
        setShowScanner(false);
      },
      () => {}
    );

    startPromise.catch(err => {
      if (!cancelled) {
        setError('No se pudo acceder a la cámara: ' + err);
        setShowScanner(false);
      }
    });

    return () => {
      cancelled = true;
      // Detener solo cuando start() haya terminado para evitar errores de estado
      startPromise
        .catch(() => {})
        .then(() => scanner.stop().then(() => scanner.clear()))
        .catch(() => {});
    };
  }, [showScanner]);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const response = await bundleService.getBundles();
      let data = response.data;

      // City Manager solo ve sus bundles y los de los usuarios a su cargo
      if (user?.levelUser === 'City Manager') {
        const managerName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        data = data.filter(b => b.userId === user.userId || b.headInCharge === managerName);
      }

      setBundles(data);
    } catch (err) {
      setError('Error al cargar bandeos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [deletingBundle, setDeletingBundle] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await bundleService.deleteBundle(deletingBundle.bundleId);
      setDeletingBundle(null);
      loadBundles();
    } catch (err) {
      setError('Error al eliminar bandeo: ' + err.message);
      setDeletingBundle(null);
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
    marginRight: '0.4rem', border: '1px solid', backgroundColor: 'transparent'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2340', fontSize: '1.4rem' }}>Bandeos</h2>
          <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{filteredBundles.length} de {bundles.length} bandeo(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={onImport} style={{ ...headerBtn, backgroundColor: '#eef2fb', color: '#2d3f6e', border: '1px solid #c7d3f0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importar desde Excel
          </button>
          <button onClick={onCreate} style={{ ...headerBtn, background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(84,112,198,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar Bandeo
          </button>
        </div>
      </div>

      {bundles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No hay bandeos registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                {columns.map(col => (
                  <th key={col.key} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{col.label}</span>
                      <button
                        onClick={() => setActiveFilter(activeFilter === col.key ? null : col.key)}
                        style={{
                          padding: '0.25rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: filters[col.key] ? '#007bff' : '#6c757d'
                        }}
                        title={`Buscar en ${col.label}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                      {col.key === 'serialNumber' && (
                        <button
                          onClick={() => setShowScanner(true)}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#6c757d'
                          }}
                          title="Escanear código de barras"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
                            <line x1="4" y1="5" x2="4" y2="19" strokeWidth="3"/>
                            <line x1="8.5" y1="5" x2="8.5" y2="19" strokeWidth="1.5"/>
                            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5"/>
                            <line x1="16" y1="5" x2="16" y2="19" strokeWidth="1.5"/>
                            <line x1="19.5" y1="5" x2="19.5" y2="19" strokeWidth="3"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    {activeFilter === col.key && (
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Buscar ${col.label}...`}
                        value={filters[col.key] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                        style={{
                          width: '100%',
                          marginTop: '0.5rem',
                          padding: '0.35rem 0.6rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 'normal',
                          boxSizing: 'border-box',
                          backgroundColor: '#f8f9fa',
                          color: '#333',
                          colorScheme: 'light',
                          outline: 'none'
                        }}
                      />
                    )}
                  </th>
                ))}
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBundles.map((bundle) => (
                <tr key={bundle.bundleId} style={{ borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>
                      {col.key === 'createTime' ? (col.value(bundle) || '-') : col.value(bundle)}
                    </td>
                  ))}
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => onAssign(bundle)}
                      style={{ ...actionBtn, color: '#17a2b8', borderColor: '#17a2b8' }}
                      title="Asignar Bandeo"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    {canEditBundles && (<>
                    <button
                      onClick={() => onEdit(bundle)}
                      style={{ ...actionBtn, color: '#007bff', borderColor: '#007bff' }}
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3L18.5 2.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingBundle(bundle)}
                      style={{ ...actionBtn, color: '#dc3545', borderColor: '#dc3545', marginRight: 0 }}
                      title="Eliminar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                    </>)}
                  </td>
                </tr>
              ))}
              {filteredBundles.length === 0 && (
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
      {deletingBundle && (
        <div
          onClick={() => !deleting && setDeletingBundle(null)}
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
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Eliminar bandeo?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a eliminar el bandeo <strong>{deletingBundle.serialNumber}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingBundle(null)}
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

      {showScanner && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowScanner(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '90%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1a2340' }}>Escanear Código de Barras</h3>
              <button
                onClick={() => setShowScanner(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            <div id="barcode-scanner" style={{ width: '100%', overflow: 'hidden', borderRadius: '4px' }}></div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
              Apunta la cámara al código de barras del número de serie
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BundleList;
