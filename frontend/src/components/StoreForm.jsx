import { useState, useEffect } from 'react';
import { storeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StoreForm({ store, onSave, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    store_code: '',
    store_name: '',
    city: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (store) {
      setFormData({
        store_code: store.storeCode,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const storeData = {
        store_code: formData.store_code,
        store_name: formData.store_name,
        city: formData.city,
      };
      if (!store) storeData.user_id = user.userId;

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
    <div style={{ maxWidth: '560px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', padding: '1.5rem 2rem', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{store ? 'Editar Tienda' : 'Crear Tienda'}</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          {store ? 'Actualiza los datos de la tienda' : 'Registra una nueva tienda en el sistema'}
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px' }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '10px' }}>
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
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: store ? '#ececec' : '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
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
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          />
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
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #5470c6, #2d3f6e)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
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
              backgroundColor: 'white',
              color: '#555',
              border: '1px solid #ddd',
              borderRadius: '10px',
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
    </div>
  );
}

export default StoreForm;
