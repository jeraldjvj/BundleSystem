import { useState, useEffect } from 'react';
import { smartphoneModelService } from '../services/api';

function SmartphoneModelForm({ smartphoneModel, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    product_id: '',
    model_name: '',
    sku_name: '',
    ram: '',
    rom: '',
    color_eng: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (smartphoneModel) {
      setFormData({
        product_id: smartphoneModel.productId || '',
        model_name: smartphoneModel.modelName || '',
        sku_name: smartphoneModel.skuName || '',
        ram: smartphoneModel.ram || '',
        rom: smartphoneModel.rom || '',
        color_eng: smartphoneModel.colorEng || '',
      });
    }
  }, [smartphoneModel]);

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
      if (smartphoneModel) {
        await smartphoneModelService.updateSmartphoneModel(smartphoneModel.smartphoneModelId, formData);
        setMessage('Modelo de smartphone actualizado exitosamente!');
      } else {
        await smartphoneModelService.createSmartphoneModel(formData);
        setMessage('Modelo de smartphone creado exitosamente!');
      }

      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar modelo de smartphone: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
      <h2>{smartphoneModel ? 'Editar Modelo de Smartphone' : 'Crear Modelo de Smartphone'}</h2>

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
          <label htmlFor="product_id" style={labelStyle}>
            Product ID:
          </label>
          <input
            type="text"
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            maxLength={45}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="model_name" style={labelStyle}>
            Nombre del Modelo:
          </label>
          <input
            type="text"
            id="model_name"
            name="model_name"
            value={formData.model_name}
            onChange={handleChange}
            required
            maxLength={50}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="sku_name" style={labelStyle}>
            SKU Name:
          </label>
          <input
            type="text"
            id="sku_name"
            name="sku_name"
            value={formData.sku_name}
            onChange={handleChange}
            required
            maxLength={200}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ marginBottom: '1rem', flex: 1 }}>
            <label htmlFor="ram" style={labelStyle}>
              RAM:
            </label>
            <input
              type="text"
              id="ram"
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              required
              maxLength={5}
              placeholder="ej: 4GB"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem', flex: 1 }}>
            <label htmlFor="rom" style={labelStyle}>
              ROM:
            </label>
            <input
              type="text"
              id="rom"
              name="rom"
              value={formData.rom}
              onChange={handleChange}
              required
              maxLength={5}
              placeholder="ej: 64GB"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="color_eng" style={labelStyle}>
            Color (English):
          </label>
          <input
            type="text"
            id="color_eng"
            name="color_eng"
            value={formData.color_eng}
            onChange={handleChange}
            required
            maxLength={45}
            placeholder="ej: Black"
            style={inputStyle}
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
            {smartphoneModel ? 'Actualizar' : 'Crear'}
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

export default SmartphoneModelForm;
