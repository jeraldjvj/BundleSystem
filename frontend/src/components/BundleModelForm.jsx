import { useState, useEffect } from 'react';
import { bundleModelService } from '../services/api';

function BundleModelForm({ bundleModel, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    bundle_name: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (bundleModel) {
      setFormData({
        bundle_name: bundleModel.bundleName,
      });
    }
  }, [bundleModel]);

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
      const dataToSubmit = {
        bundle_name: formData.bundle_name,
      };

      if (bundleModel) {
        await bundleModelService.updateBundleModel(bundleModel.bundleModelId, dataToSubmit);
        setMessage('Modelo de bundle actualizado exitosamente!');
      } else {
        await bundleModelService.createBundleModel(dataToSubmit);
        setMessage('Modelo de bundle creado exitosamente!');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar modelo de bundle: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
      <h2>{bundleModel ? 'Editar Modelo de Bundle' : 'Crear Modelo de Bundle'}</h2>
      
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
          <label htmlFor="bundle_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nombre del Bundle:
          </label>
          <input
            type="text"
            id="bundle_name"
            name="bundle_name"
            value={formData.bundle_name}
            onChange={handleChange}
            required
            maxLength={45}
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
            {bundleModel ? 'Actualizar' : 'Crear'}
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

export default BundleModelForm;
