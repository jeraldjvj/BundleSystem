import { useState, useEffect } from 'react';
import { bundleService, smartphoneService, storeService, bundleDeliveredService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#333'
};

const sectionStyle = {
  marginBottom: '1.5rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

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

  const [formData, setFormData] = useState({ client_full_name: '', client_phone: '' });
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const verifySerial = async () => {
    const serial = serialInput.trim();
    if (!serial) return;
    setSerialChecking(true);
    setSerialMsg(null);
    setVerifiedBundle(null);
    try {
      const res = await bundleService.verifySerial(serial, user.userId);
      setVerifiedBundle(res.data);
      setSerialMsg({ ok: true, text: `Verificado: ${res.data.bundleModelName || 'Bundle'} — ${res.data.projectName || ''}` });
    } catch (err) {
      const msg = err.response?.status === 403
        ? 'Este serial existe pero NO está asignado a tu usuario'
        : err.response?.status === 404
          ? 'Serial no encontrado en la base de datos'
          : (err.response?.data?.error || err.message);
      setSerialMsg({ ok: false, text: msg });
    } finally {
      setSerialChecking(false);
    }
  };

  const verifyImei = async () => {
    const imei = imeiInput.trim();
    if (!imei) return;
    setImeiChecking(true);
    setImeiMsg(null);
    setVerifiedPhone(null);
    try {
      const res = await smartphoneService.getByImei(imei);
      setVerifiedPhone(res.data);
      setImeiMsg({ ok: true, text: `Encontrado: ${res.data.modelName || 'Smartphone'} (${res.data.status})` });
    } catch (err) {
      setImeiMsg({
        ok: false,
        text: err.response?.status === 404
          ? 'IMEI no encontrado en smartphones_database'
          : (err.response?.data?.error || err.message)
      });
    } finally {
      setImeiChecking(false);
    }
  };

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

    if (!verifiedBundle) return setError('Verifica el Número de Serie del bundle primero');
    if (!verifiedPhone) return setError('Verifica el IMEI del smartphone primero');
    if (!selectedStore) return setError('Selecciona un store');
    if (!picture) return setError('Sube o toma una fotografía del cliente');
    if (!formData.client_full_name.trim()) return setError('El nombre del cliente es requerido');
    if (!formData.client_phone.trim()) return setError('El teléfono del cliente es requerido');

    setSubmitting(true);
    try {
      const upload = await bundleDeliveredService.uploadPicture(picture);
      await bundleDeliveredService.createDelivery({
        user_id: user.userId,
        bundle_id: verifiedBundle.bundleId,
        smartphones_id: verifiedPhone.smartphonesId,
        client_full_name: formData.client_full_name.trim(),
        client_phone: formData.client_phone.trim(),
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
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: ok ? '#d4edda' : '#f8d7da',
    color: ok ? '#155724' : '#721c24'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ color: '#333' }}>Entrega de Bundles</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Registra la entrega de un bundle a un cliente. La entrega se asignará a tu usuario ({user?.firstName} {user?.lastName}).
      </p>

      {error && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Bundle por serial */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>Bundle</h3>
          <label style={labelStyle}>Número de Serie (Serial Number) *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={serialInput}
              onChange={(e) => { setSerialInput(e.target.value); setVerifiedBundle(null); setSerialMsg(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifySerial(); } }}
              placeholder="Ej. 71619..."
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={verifySerial}
              disabled={serialChecking || !serialInput.trim()}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
            >
              {serialChecking ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
          {serialMsg && <div style={msgStyle(serialMsg.ok)}>{serialMsg.text}</div>}
          {verifiedBundle && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '0.875rem' }}>
              <strong>Bundle #{verifiedBundle.bundleId}</strong> — {verifiedBundle.bundleModelName} — {verifiedBundle.projectName}
            </div>
          )}
        </div>

        {/* Smartphone por IMEI */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>Smartphone</h3>
          <label style={labelStyle}>IMEI 1 *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={imeiInput}
              onChange={(e) => { setImeiInput(e.target.value); setVerifiedPhone(null); setImeiMsg(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifyImei(); } }}
              placeholder="Ej. 860000000000001"
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={verifyImei}
              disabled={imeiChecking || !imeiInput.trim()}
              style={{ padding: '0.75rem 1.25rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
            >
              {imeiChecking ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {imeiMsg && <div style={msgStyle(imeiMsg.ok)}>{imeiMsg.text}</div>}
          {verifiedPhone && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '0.875rem' }}>
              <strong>ID #{verifiedPhone.smartphonesId}</strong> — {verifiedPhone.modelName} — {verifiedPhone.skuName}
            </div>
          )}
        </div>

        {/* Datos del cliente */}
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0 }}>Cliente</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nombre Completo *</label>
            <input
              type="text"
              value={formData.client_full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_full_name: e.target.value }))}
              maxLength={120}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Teléfono *</label>
            <input
              type="text"
              value={formData.client_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              maxLength={45}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Fotografía del Cliente *</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePicture}
              style={{ fontSize: '0.9rem' }}
              required={!picture}
            />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
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
          <h3 style={{ marginTop: 0 }}>Store</h3>
          {storesLoading ? (
            <p style={{ color: '#666' }}>Cargando stores…</p>
          ) : stores.length === 0 ? (
            <div style={{ padding: '0.75rem', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px' }}>
              No tienes stores asignados. Pide a un Office Manager que asigne un store a tu usuario.
            </div>
          ) : (
            <>
              <label style={labelStyle}>Nombre del Store *</label>
              <select
                value={selectedStore?.storeCode || ''}
                onChange={(e) => setSelectedStore(stores.find(s => s.storeCode === e.target.value) || null)}
                style={inputStyle}
                required
              >
                <option value="">— Selecciona un store —</option>
                {stores.map(s => (
                  <option key={s.storeCode} value={s.storeCode}>{s.storeName}</option>
                ))}
              </select>
              {selectedStore && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '0.875rem' }}>
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
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !verifiedBundle || !verifiedPhone || !selectedStore || !picture}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: submitting || !verifiedBundle || !verifiedPhone || !selectedStore || !picture ? '#adb5bd' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'wait' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {submitting ? 'Registrando…' : 'Registrar Entrega'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BundleDeliveryForm;
