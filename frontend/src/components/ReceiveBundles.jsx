import { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { bundleService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReceiveBundles() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { transfer, approve }
  const [showBarcode, setShowBarcode] = useState(false);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (showBarcode && user?.miId && barcodeRef.current) {
      JsBarcode(barcodeRef.current, String(user.miId), {
        format: 'CODE128',
        lineColor: '#1a2340',
        width: 2,
        height: 90,
        fontSize: 18,
        margin: 10,
      });
    }
  }, [showBarcode, user]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const res = await bundleService.getPendingTransfers(user.userId);
      setTransfers(res.data);
    } catch (err) {
      setError('Error al cargar transferencias: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [user.userId]);

  const handleResolve = async (transferId, approve) => {
    setResolvingId(transferId);
    setError('');
    setSuccess('');
    try {
      if (approve) {
        await bundleService.approveTransfer(transferId);
        setSuccess('Transferencia aprobada. El bandeo ya es tuyo.');
      } else {
        await bundleService.rejectTransfer(transferId);
        setSuccess('Transferencia rechazada.');
      }
      loadTransfers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resolver la transferencia');
    } finally {
      setResolvingId(null);
      setConfirmAction(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>Cargando transferencias...</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '10px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2340', fontSize: '1.4rem' }}>Recibir Bandeos</h2>
          <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>
            {transfers.length} transferencia(s) pendiente(s) de aprobación
          </p>
        </div>
        <button
          onClick={() => setShowBarcode(true)}
          title="Mostrar mi MI ID como código de barras"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.15rem', backgroundColor: 'white', color: '#1a2340',
            border: '1px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
            <line x1="4" y1="5" x2="4" y2="19" strokeWidth="3"/>
            <line x1="8.5" y1="5" x2="8.5" y2="19" strokeWidth="1.5"/>
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5"/>
            <line x1="16" y1="5" x2="16" y2="19" strokeWidth="1.5"/>
            <line x1="19.5" y1="5" x2="19.5" y2="19" strokeWidth="3"/>
          </svg>
          Mi código
        </button>
      </div>

      {error && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>{success}</div>}

      {transfers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No tienes transferencias pendientes
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transfers.map(t => (
            <div key={t.transfer_history_id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
              padding: '1.1rem 1.5rem',
              backgroundColor: 'white', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)', flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#333', minWidth: '200px' }}>
                <div style={{ fontWeight: 700, color: '#1a2340', fontSize: '1rem' }}>{t.serial_number}</div>
                <div style={{ color: '#666', marginTop: '0.15rem' }}>{t.bundle_name || 'Bandeo'}</div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  De: <strong>{t.from_user_name || `Usuario ${t.old_user_id}`}</strong> — {new Date(t.create_time).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setConfirmAction({ transfer: t, approve: true })}
                  disabled={resolvingId === t.transfer_history_id}
                  title="Aprobar transferencia"
                  style={{
                    width: '52px', height: '52px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white',
                    cursor: resolvingId === t.transfer_history_id ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(84,112,198,0.35)',
                    opacity: resolvingId === t.transfer_history_id ? 0.5 : 1
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmAction({ transfer: t, approve: false })}
                  disabled={resolvingId === t.transfer_history_id}
                  title="Rechazar transferencia"
                  style={{
                    width: '52px', height: '52px', borderRadius: '12px',
                    border: '1px solid #dc3545', backgroundColor: 'transparent', color: '#dc3545',
                    cursor: resolvingId === t.transfer_history_id ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    opacity: resolvingId === t.transfer_history_id ? 0.5 : 1
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmAction && (
        <div
          onClick={() => !resolvingId && setConfirmAction(null)}
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
              backgroundColor: confirmAction.approve ? '#eef2fb' : '#fdecea',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {confirmAction.approve ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5470c6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>
              {confirmAction.approve ? '¿Aprobar transferencia?' : '¿Rechazar transferencia?'}
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              {confirmAction.approve
                ? <>Vas a recibir el bandeo <strong>{confirmAction.transfer.serial_number}</strong> de <strong>{confirmAction.transfer.from_user_name || `Usuario ${confirmAction.transfer.old_user_id}`}</strong>.</>
                : <>Vas a rechazar el bandeo <strong>{confirmAction.transfer.serial_number}</strong>. Volverá al usuario que lo envió.</>}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={resolvingId}
                style={{
                  flex: 1, padding: '0.7rem', backgroundColor: 'white', color: '#555',
                  border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleResolve(confirmAction.transfer.transfer_history_id, confirmAction.approve)}
                disabled={resolvingId}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px',
                  background: confirmAction.approve
                    ? 'linear-gradient(135deg, #5470c6, #2d3f6e)'
                    : '#dc3545',
                  color: 'white', cursor: resolvingId ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem',
                  boxShadow: confirmAction.approve ? '0 4px 14px rgba(84,112,198,0.35)' : 'none'
                }}
              >
                {resolvingId ? 'Procesando...' : (confirmAction.approve ? 'Aprobar' : 'Rechazar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mi MI ID como código de barras */}
      {showBarcode && (
        <div
          onClick={() => setShowBarcode(false)}
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
            <h3 style={{ margin: '0 0 0.25rem', color: '#1a2340', fontSize: '1.1rem' }}>Mi Codigo MI ID</h3>
            <p style={{ margin: '0 0 1rem', color: '#888', fontSize: '0.85rem' }}>
              Muéstralo para que te transfieran un bandeo
            </p>
            <div style={{
              padding: '1rem', backgroundColor: '#f8f9fb', borderRadius: '12px',
              border: '1px solid #eee', display: 'flex', justifyContent: 'center'
            }}>
              <svg ref={barcodeRef}></svg>
            </div>
            <p style={{ margin: '0.9rem 0 0', color: '#1a2340', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '1px' }}>
              {user?.miId || 'Sin MI ID'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiveBundles;
