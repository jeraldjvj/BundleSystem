import { useState, useEffect } from 'react';
import { bundleColorService } from '../services/api';

function BundleColorForm({ color, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    color_name_eng: '',
    color_name_spa: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (color) {
      setFormData({
        color_name_eng: color.colorNameEng,
        color_name_spa: color.colorNameSpa,
      });
    }
  }, [color]);

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
      if (color) {
        await bundleColorService.updateBundleColor(color.bundleColorId, formData);
        setMessage('Color actualizado exitosamente!');
      } else {
        await bundleColorService.createBundleColor(formData);
        setMessage('Color creado exitosamente!');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar color: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>{color ? 'Editar Color' : 'Crear Nuevo Color'}</h3>
      
      {message && (
        <div style={{ padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="color_name_eng" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
            Nombre en Inglés:
          </label>
          <input
            type="text"
            id="color_name_eng"
            name="color_name_eng"
            value={formData.color_name_eng}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="color_name_spa" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
            Nombre en Español:
          </label>
          <input
            type="text"
            id="color_name_spa"
            name="color_name_spa"
            value={formData.color_name_spa}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}
          >
            {color ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
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

export default BundleColorForm;
