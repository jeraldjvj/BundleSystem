import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { bundleService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const barcodeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
    <line x1="4" y1="5" x2="4" y2="19" strokeWidth="3"/>
    <line x1="8.5" y1="5" x2="8.5" y2="19" strokeWidth="1.5"/>
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5"/>
    <line x1="16" y1="5" x2="16" y2="19" strokeWidth="1.5"/>
    <line x1="19.5" y1="5" x2="19.5" y2="19" strokeWidth="3"/>
  </svg>
);

const inputStyle = {
  width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0',
  borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa',
  color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#444', fontSize: '0.875rem' };

function BundleShareForm() {
  const { user } = useAuth();

  const [serialInput, setSerialInput] = useState('');
  const [verifiedBundle, setVerifiedBundle] = useState(null);
  const [serialChecking, setSerialChecking] = useState(false);
  const [serialMsg, setSerialMsg] = useState(null);

  const [miIdInput, setMiIdInput] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [miIdChecking, setMiIdChecking] = useState(false);
  const [miIdMsg, setMiIdMsg] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanTarget, setScanTarget] = useState(null); // 'serial' | 'miId'
  const scannerRef = useRef(null);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const loadOutgoing = async () => {
    try {
      const res = await bundleService.getOutgoingTransfers(user.userId);
      setOutgoingTransfers(res.data);
    } catch {
      setOutgoingTransfers([]);
    }
  };

  useEffect(() => {
    loadOutgoing();
  }, [user.userId]);

  const handleCancelTransfer = async (transferId) => {
    setCancellingId(transferId);
    setError('');
    try {
      await bundleService.cancelTransfer(transferId);
      setSuccess('Transferencia cancelada');
      loadOutgoing();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar la transferencia');
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  };

  // Verificación automática del serial
  useEffect(() => {
    const serial = serialInput.trim();
    setVerifiedBundle(null);
    setSerialMsg(null);
    setSerialChecking(false);
    if (serial.length < 4) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSerialChecking(true);
      try {
        const res = await bundleService.verifySerial(serial, user.userId);
        if (cancelled) return;
        if (String(res.data.status).toLowerCase() === 'delivered') {
          setSerialMsg({ ok: false, text: 'BANDEO YA ENTREGADO' });
          return;
        }
        setVerifiedBundle(res.data);
        setSerialMsg({ ok: true, text: `Verificado: ${res.data.bundleModelName || 'Bandeo'} — Proyecto: ${res.data.projectName || res.data.projectId}` });
      } catch (err) {
        if (cancelled) return;
        const msg = err.response?.status === 403
          ? 'Este serial existe pero NO está asignado a tu usuario'
          : err.response?.status === 404
            ? 'Serial no encontrado en la base de datos'
            : (err.response?.data?.error || err.message);
        setSerialMsg({ ok: false, text: msg });
      } finally {
        if (!cancelled) setSerialChecking(false);
      }
    }, 600);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [serialInput, user.userId]);

  // Verificación automática del MI ID destino (al escribir o escanear)
  const lookupMiId = async (miIdOverride) => {
    const miId = (miIdOverride ?? miIdInput).trim();
    if (!miId) return setMiIdMsg({ ok: false, text: 'Ingresa un MI ID' });
    setMiIdChecking(true);
    setMiIdMsg(null);
    setTargetUser(null);
    try {
      const res = await userService.getUserByMiId(miId);
      const u = res.data;
      if (String(u.userId) === String(user.userId)) {
        setMiIdMsg({ ok: false, text: 'No puedes transferir el bandeo a ti mismo' });
        return;
      }
      setTargetUser(u);
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
      setMiIdMsg({ ok: true, text: `Destino: ${fullName} — ${u.levelUser || ''}` });
    } catch (err) {
      setMiIdMsg({
        ok: false,
        text: err.response?.data?.error || (err.response?.status === 404 ? 'MI ID no encontrado' : err.message)
      });
    } finally {
      setMiIdChecking(false);
    }
  };

  // Debounce: verificar MI ID automáticamente al terminar de escribir
  useEffect(() => {
    const miId = miIdInput.trim();
    setTargetUser(null);
    setMiIdMsg(null);
    setMiIdChecking(false);
    if (miId.length < 5) return;
    const timer = setTimeout(() => lookupMiId(miId), 600);
    return () => clearTimeout(timer);
  }, [miIdInput]);

  // Escáner de código de barras
  useEffect(() => {
    if (!scanTarget) return;
    const scanner = new Html5Qrcode('share-barcode-scanner', {
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.ITF, Html5QrcodeSupportedFormats.QR_CODE
      ]
    });
    scannerRef.current = scanner;
    let cancelled = false;
    const startPromise = scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => ({ width: Math.floor(w * 0.9), height: Math.floor(h * 0.4) }), aspectRatio: 1.7778 },
      (decodedText) => {
        if (scanTarget === 'serial') setSerialInput(decodedText);
        else setMiIdInput(decodedText.replace(/\D/g, ''));
        setScanTarget(null);
      },
      () => {}
    );
    startPromise.catch(err => {
      if (!cancelled) { setError('No se pudo acceder a la cámara: ' + err); setScanTarget(null); }
    });
    return () => {
      cancelled = true;
      startPromise.catch(() => {}).then(() => scanner.stop().then(() => scanner.clear())).catch(() => {});
    };
  }, [scanTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verifiedBundle) return setError('Verifica el Número de Serie del bandeo primero');
    if (!targetUser) return setError('Verifica el MI ID del usuario destino primero');

    setSubmitting(true);
    try {
      await bundleService.requestTransfer(verifiedBundle.bundleId, { new_user_id: targetUser.userId });
      setSuccess('Solicitud enviada. La transferencia quedará pendiente hasta que el usuario destino la apruebe.');
      loadOutgoing();
      setSerialInput('');
      setMiIdInput('');
      setVerifiedBundle(null);
      setTargetUser(null);
      setSerialMsg(null);
      setMiIdMsg(null);
    } catch (err) {
      setError('Error al transferir el bandeo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const msgStyle = (ok) => ({
    marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px',
    fontSize: '0.875rem',
    backgroundColor: ok ? '#d4edda' : '#fdecea',
    color: ok ? '#155724' : '#c0392b'
  });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', borderRadius: '16px', padding: '1.5rem 2rem', color: 'white', marginBottom: '1.5rem', marginTop: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Compartir Bandeos</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          Transfiere un bandeo de tu inventario a otro usuario
        </p>
      </div>

      {error && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1a2340', fontSize: '1rem', fontWeight: 700 }}>Bandeo a transferir</h3>
          <label style={labelStyle}>Número de Serie (Serial Number) *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              placeholder="Ej. 71619/CEAGDF6P404192"
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={() => setScanTarget('serial')}
              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Escanear código de barras"
            >
              {barcodeIcon}
            </button>
          </div>
          {serialChecking && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Verificando…</div>}
          {serialMsg && <div style={msgStyle(serialMsg.ok)}>{serialMsg.text}</div>}
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1a2340', fontSize: '1rem', fontWeight: 700 }}>Usuario destino</h3>
          <label style={labelStyle}>MI ID *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={miIdInput}
              onChange={(e) => { setMiIdInput(e.target.value); setTargetUser(null); setMiIdMsg(null); }}
              placeholder="Ingresa el MI ID del usuario"
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={() => setScanTarget('miId')}
              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Escanear código de barras"
            >
              {barcodeIcon}
            </button>
          </div>
          {miIdMsg && <div style={msgStyle(miIdMsg.ok)}>{miIdMsg.text}</div>}
        </div>

        <button
          type="submit"
          disabled={submitting || !verifiedBundle || !targetUser}
          style={{
            width: '100%', padding: '0.8rem', border: 'none', borderRadius: '10px',
            cursor: (submitting || !verifiedBundle || !targetUser) ? 'not-allowed' : 'pointer',
            background: (submitting || !verifiedBundle || !targetUser) ? '#adb5bd' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
            color: 'white', fontSize: '1rem', fontWeight: 'bold',
            boxShadow: (verifiedBundle && targetUser) ? '0 4px 14px rgba(84,112,198,0.3)' : 'none'
          }}
        >
          {submitting ? 'Transfiriendo…' : 'Transferir Bandeo'}
        </button>
      </form>

      {outgoingTransfers.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1a2340', fontSize: '1rem', fontWeight: 700 }}>
            Bandeos en transferencia ({outgoingTransfers.length})
          </h3>
          {outgoingTransfers.map(t => (
            <div key={t.transfer_history_id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
              padding: '0.9rem 1rem', marginBottom: '0.6rem',
              backgroundColor: '#f8f9fb', border: '1px solid #eee', borderRadius: '10px', flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#333', minWidth: '180px' }}>
                <div style={{ fontWeight: 700, color: '#1a2340' }}>{t.serial_number}</div>
                <div style={{ color: '#666' }}>{t.bundle_name || 'Bandeo'}</div>
                <div style={{ color: '#888', fontSize: '0.8rem' }}>
                  Para: <strong>{t.to_user_name || `Usuario ${t.new_user_id}`}</strong> — {new Date(t.create_time).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setConfirmCancel(t)}
                disabled={cancellingId === t.transfer_history_id}
                title="Cancelar transferencia"
                style={{
                  padding: '0.5rem 1rem', backgroundColor: 'white', color: '#dc3545',
                  border: '1px solid #dc3545', borderRadius: '8px',
                  cursor: cancellingId === t.transfer_history_id ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', fontWeight: 'bold',
                  opacity: cancellingId === t.transfer_history_id ? 0.5 : 1
                }}
              >
                {cancellingId === t.transfer_history_id ? 'Cancelando…' : 'Cancelar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {confirmCancel && (
        <div
          onClick={() => !cancellingId && setConfirmCancel(null)}
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
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Cancelar transferencia?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a cancelar la transferencia del bandeo <strong>{confirmCancel.serial_number}</strong> a <strong>{confirmCancel.to_user_name || `Usuario ${confirmCancel.new_user_id}`}</strong>. El bandeo permanecerá en tu inventario.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={!!cancellingId}
                style={{
                  flex: 1, padding: '0.7rem', backgroundColor: 'white', color: '#555',
                  border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                Volver
              </button>
              <button
                onClick={() => handleCancelTransfer(confirmCancel.transfer_history_id)}
                disabled={!!cancellingId}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px',
                  backgroundColor: '#dc3545', color: 'white',
                  cursor: cancellingId ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                {cancellingId ? 'Cancelando...' : 'Cancelar transferencia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {scanTarget && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setScanTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '420px', width: '90%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1a2340' }}>Escanear {scanTarget === 'serial' ? 'Número de Serie' : 'MI ID'}</h3>
              <button type="button" onClick={() => setScanTarget(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div id="share-barcode-scanner" style={{ width: '100%', overflow: 'hidden', borderRadius: '10px' }}></div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
              Apunta la cámara al código de barras CODE_128
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BundleShareForm;
