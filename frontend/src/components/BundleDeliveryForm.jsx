import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { bundleService, smartphoneService, storeService, bundleDeliveredService } from '../services/api';
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

const scanButtonStyle = {
  padding: '0.5rem 0.75rem',
  backgroundColor: '#343a40',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  fontSize: '0.95rem',
  backgroundColor: '#f8f9fa',
  color: '#333',
  colorScheme: 'light',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  fontWeight: 600,
  color: '#444',
  fontSize: '0.875rem'
};

const sectionStyle = {
  marginBottom: '1.25rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
};

const sectionTitle = { margin: '0 0 1rem', color: '#1a2340', fontSize: '1rem', fontWeight: 700 };

function BundleDeliveryForm({ onSave, onCancel }) {
  const { user } = useAuth();

  const [serialInput, setSerialInput] = useState('');
  const [verifiedBundle, setVerifiedBundle] = useState(null);
  const [serialChecking, setSerialChecking] = useState(false);
  const [serialMsg, setSerialMsg] = useState(null);

  const [imeiInput, setImeiInput] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState(null);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiMsg, setImeiMsg] = useState(null);

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeSearch, setStoreSearch] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  const [formData, setFormData] = useState({ client_full_name: '', client_phone: '' });
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [scanTarget, setScanTarget] = useState(null); // 'serial' | 'imei'
  const scannerRef = useRef(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await storeService.getStoresByUser(user.userId);
        setStores(res.data);
      } catch (err) {
        setError('Error al cargar stores: ' + (err.response?.data?.error || err.message));
      } finally {
        setStoresLoading(false);
      }
    };
    loadStores();
  }, [user.userId]);

  // Verificación automática del serial con debounce (600ms tras dejar de escribir)
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
        setSerialMsg({ ok: true, text: `Verificado: ${res.data.bundleModelName || 'Bundle'}` });
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

  // Verificación automática del IMEI con debounce
  useEffect(() => {
    const imei = imeiInput.trim();
    setVerifiedPhone(null);
    setImeiMsg(null);
    setImeiChecking(false);
    if (imei.length < 8) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setImeiChecking(true);
      try {
        const res = await smartphoneService.getByImei(imei);
        if (cancelled) return;
        if (String(res.data.status).toLowerCase() === 'delivered') {
          setImeiMsg({ ok: false, text: 'BANDEO YA ENTREGADO' });
          return;
        }
        setVerifiedPhone(res.data);
        setImeiMsg({ ok: true, text: `Verificado: ${res.data.skuName || res.data.modelName || 'Smartphone'} — ${res.data.distributorName || ''}` });
      } catch (err) {
        if (cancelled) return;
        setImeiMsg({
          ok: false,
          text: err.response?.status === 404
            ? 'IMEI no encontrado en la base de datos'
            : (err.response?.data?.error || err.message)
        });
      } finally {
        if (!cancelled) setImeiChecking(false);
      }
    }, 600);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [imeiInput]);

  // Escáner de código de barras (CODE_128) por cámara
  useEffect(() => {
    if (!scanTarget) return;

    const scanner = new Html5Qrcode('delivery-barcode-scanner', {
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    });
    scannerRef.current = scanner;
    let cancelled = false;

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (w, h) => ({ width: Math.floor(w * 0.9), height: Math.floor(h * 0.4) }),
        aspectRatio: 1.7778,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      },
      (decodedText) => {
        if (scanTarget === 'serial') setSerialInput(decodedText);
        else if (scanTarget === 'imei') setImeiInput(decodedText.replace(/\D/g, ''));
        setScanTarget(null);
      },
      () => {}
    );

    startPromise.catch(err => {
      if (!cancelled) {
        setError('No se pudo acceder a la cámara: ' + err);
        setScanTarget(null);
      }
    });

    return () => {
      cancelled = true;
      startPromise
        .catch(() => {})
        .then(() => scanner.stop().then(() => scanner.clear()))
        .catch(() => {});
    };
  }, [scanTarget]);

  const handlePicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verifiedBundle) return setError('Verifica el Número de Serie del bandeo primero');
    if (!verifiedPhone) return setError('Verifica el IMEI del smartphone primero');
    if (!selectedStore) return setError('Selecciona un store');
    if (!picture) return setError('Sube o toma una fotografía del cliente');
    if (!formData.client_full_name.trim()) return setError('El nombre del cliente es requerido');
    if (!/^\d{8}$/.test(formData.client_phone)) return setError('El teléfono debe tener exactamente 8 dígitos');

    setSubmitting(true);
    try {
      const upload = await bundleDeliveredService.uploadPicture(picture);
      await bundleDeliveredService.createDelivery({
        user_id: user.userId,
        bundle_id: verifiedBundle.bundleId,
        smartphones_id: verifiedPhone.smartphonesId,
        client_full_name: formData.client_full_name.trim(),
        client_phone: `+591${formData.client_phone.trim()}`,
        client_picture: upload.data.client_picture,
        store_code: selectedStore.storeCode,
        store_name: selectedStore.storeName,
      });
      setSuccess('Entrega registrada correctamente');
      setTimeout(() => onSave(), 800);
    } catch (err) {
      setError('Error al registrar la entrega: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const msgStyle = (ok) => ({
    marginTop: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    backgroundColor: ok ? '#d4edda' : '#f8d7da',
    color: ok ? '#155724' : '#721c24'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', borderRadius: '16px', padding: '1.5rem 2rem', color: 'white', marginBottom: '1.5rem', marginTop: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Entrega de Bandeos</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          Registra la entrega de un bandeo a un cliente
        </p>
      </div>

      {error && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>{error}</div>}
      {success && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Bandeo por serial */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>Bandeo</h3>
          <label style={labelStyle}>Número de Serie (Serial Number) *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              placeholder="Ej. 71619..."
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={() => setScanTarget('serial')}
              style={scanButtonStyle}
              title="Escanear código de barras"
            >
              {barcodeIcon}
            </button>
          </div>
          {serialChecking && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Verificando…</div>}
          {serialMsg && <div style={msgStyle(serialMsg.ok)}>{serialMsg.text}</div>}
        </div>

        {/* Smartphone por IMEI */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>Smartphone</h3>
          <label style={labelStyle}>IMEI 1 *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              placeholder="Ej. 860000000000001"
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={() => setScanTarget('imei')}
              style={scanButtonStyle}
              title="Escanear código de barras"
            >
              {barcodeIcon}
            </button>
          </div>
          {imeiChecking && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Buscando…</div>}
          {imeiMsg && <div style={msgStyle(imeiMsg.ok)}>{imeiMsg.text}</div>}
        </div>

        {/* Datos del cliente */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>Cliente</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nombre Completo *</label>
            <input
              type="text"
              value={formData.client_full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_full_name: e.target.value.toUpperCase() }))}
              maxLength={120}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Teléfono *</label>
            <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0 0.75rem',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #ccc',
                fontSize: '1rem',
                color: '#333',
                whiteSpace: 'nowrap'
              }}>
                <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'block' }}>
                  <rect width="20" height="14" fill="#007934" />
                  <rect width="20" height="9.33" fill="#F9E300" />
                  <rect width="20" height="4.66" fill="#D52B1E" />
                </svg>
                +591
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formData.client_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                maxLength={8}
                placeholder="70000000"
                style={{ ...inputStyle, border: 'none', borderRadius: 0, outline: 'none' }}
                required
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fotografía de la Entrega *</label>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.15rem', backgroundColor: '#eef2fb', color: '#2d3f6e',
              border: '1px solid #c7d3f0', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {picture ? 'Cambiar foto' : 'Tomar o subir foto'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePicture}
                style={{ display: 'none' }}
                required={!picture}
              />
            </label>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
              En un dispositivo móvil puedes tomar la foto directamente con la cámara, o elegir una imagen de la galería.
            </p>
            {picturePreview && (
              <img
                src={picturePreview}
                alt="Vista previa"
                style={{ marginTop: '0.75rem', maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }}
              />
            )}
          </div>
        </div>

        {/* Store */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>Tienda</h3>
          {storesLoading ? (
            <p style={{ color: '#666' }}>Cargando stores…</p>
          ) : stores.length === 0 ? (
            <div style={{ padding: '0.75rem', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '10px' }}>
              No tienes stores asignados. Pide a un Office Manager que asigne un store a tu usuario.
            </div>
          ) : (
            <>
              <label style={labelStyle}>Nombre de Tienda *</label>
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => { setStoreSearch(e.target.value); setSelectedStore(null); setShowStoreDropdown(true); }}
                onFocus={() => setShowStoreDropdown(true)}
                onBlur={() => setTimeout(() => setShowStoreDropdown(false), 150)}
                placeholder="Busca por nombre, código o ciudad..."
                required={!selectedStore}
                style={inputStyle}
              />
              {showStoreDropdown && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '10px',
                    marginTop: '0.35rem', maxHeight: '190px', overflowY: 'auto', overscrollBehavior: 'contain',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                >
                  {(() => {
                    const q = storeSearch.toLowerCase();
                    const filtered = stores.filter(s =>
                      !q || (s.storeName || '').toLowerCase().includes(q) ||
                      String(s.storeCode).toLowerCase().includes(q) ||
                      (s.city || '').toLowerCase().includes(q)
                    );
                    if (filtered.length === 0) {
                      return <div style={{ padding: '0.9rem 1rem', color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>Sin resultados</div>;
                    }
                    return filtered.map(s => (
                      <div
                        key={s.storeCode}
                        onMouseDown={() => {
                          setSelectedStore(s);
                          setStoreSearch(s.storeName);
                          setShowStoreDropdown(false);
                        }}
                        style={{
                          padding: '0.7rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333',
                          backgroundColor: selectedStore?.storeCode === s.storeCode ? '#eef2fb' : 'transparent',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4fc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedStore?.storeCode === s.storeCode ? '#eef2fb' : 'transparent'}
                      >
                        {s.storeName} <span style={{ color: '#999', fontSize: '0.8rem' }}>— {s.storeCode}, {s.city}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
              {selectedStore && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#e7f3ff', borderRadius: '10px', fontSize: '0.875rem' }}>
                  Store Code: <strong>{selectedStore.storeCode}</strong> — {selectedStore.city}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '0.8rem 1.5rem', backgroundColor: 'white', color: '#555', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !verifiedBundle || !verifiedPhone || !selectedStore || !picture}
            style={{
              padding: '0.8rem 1.5rem',
              background: submitting || !verifiedBundle || !verifiedPhone || !selectedStore || !picture ? '#adb5bd' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'wait' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: !(submitting || !verifiedBundle || !verifiedPhone || !selectedStore || !picture) ? '0 4px 14px rgba(84,112,198,0.3)' : 'none'
            }}
          >
            {submitting ? 'Registrando…' : 'Registrar Entrega'}
          </button>
        </div>
      </form>

      {scanTarget && (
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
          onClick={() => setScanTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '90%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                Escanear {scanTarget === 'serial' ? 'Número de Serie' : 'IMEI'}
              </h3>
              <button
                type="button"
                onClick={() => setScanTarget(null)}
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
            <div id="delivery-barcode-scanner" style={{ width: '100%', overflow: 'hidden', borderRadius: '10px' }}></div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.75rem', textAlign: 'center' }}>
              Apunta la cámara al código de barras CODE_128
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BundleDeliveryForm;
