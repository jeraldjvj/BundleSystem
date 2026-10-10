import { useState, useEffect } from 'react';
import { storeService, userService } from '../services/api';

function StoreForm({ store, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    store_code: '',
    mi_id: '',
    rms_store_code: '',
    store_name: '',
    city: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingMiId, setLoadingMiId] = useState(false);
  const [miIdError, setMiIdError] = useState('');

  useEffect(() => {
    if (store) {
      setFormData({
        store_code: store.storeCode,
        mi_id: store.miId || '',
        rms_store_code: store.rmsStoreCode,
        store_name: store.storeName,
        city: store.city || '',
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'mi_id') {
      setMiIdError('');
    }
  };

  const handleMiIdBlur = async () => {
    if (!formData.mi_id) return;
    
    setLoadingMiId(true);
    setMiIdError('');
    
    try {
      const response = await userService.getUsers();
      const user = response.data.find(u => u.miId === formData.mi_id);
      
      if (!user) {
        setMiIdError('MI ID no encontrado');
      }
    } catch (err) {
      setMiIdError('Error al validar MI ID');
    } finally {
      setLoadingMiId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validar MI ID
    try {
      const response = await userService.getUsers();
      const user = response.data.find(u => u.miId === formData.mi_id);
      
      if (!user) {
        setError('MI ID no encontrado en la base de datos');
        return;
      }

      const storeData = {
        store_code: formData.store_code,
        user_id: user.userId,
        rms_store_code: formData.rms_store_code,
        store_name: formData.store_name,
        city: formData.city,
      };

      if (store) {
        await storeService.updateStore(formData.store_code, storeData);
        setMessage('Tienda actualizada exitosamente!');
      } else {
        await storeService.createStore(storeData);
        setMessage('Tienda creada exitosamente!');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar tienda: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
      <h2>{store ? 'Editar Tienda' : 'Crear Tienda'}</h2>
      
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="store_code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Código de Tienda:
          </label>
          <input
            type="text"
            id="store_code"
            name="store_code"
            value={formData.store_code}
            onChange={handleChange}
            required
            disabled={!!store}
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: store ? '#f8f9fa' : 'white' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="store_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nombre de Tienda:
          </label>
          <input
            type="text"
            id="store_name"
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="rms_store_code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Código RMS:
          </label>
          <input
            type="text"
            id="rms_store_code"
            name="rms_store_code"
            value={formData.rms_store_code}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="mi_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            MI ID:
          </label>
          <input
            type="text"
            id="mi_id"
            name="mi_id"
            value={formData.mi_id}
            onChange={handleChange}
            onBlur={handleMiIdBlur}
            required
            maxLength={10}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {loadingMiId && <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '0.5rem' }}>Validando...</span>}
          {miIdError && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{miIdError}</div>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Ciudad:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            maxLength={50}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {store ? 'Actualizar' : 'Crear'}
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

export default StoreForm;
