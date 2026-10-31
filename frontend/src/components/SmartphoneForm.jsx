import { useState, useEffect } from 'react';
import { smartphoneService, smartphoneModelService, distributorService } from '../services/api';

function SmartphoneForm({ smartphone, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    smartphone_model_id: '',
    imei_1: '',
    distributor_id: '',
  });
  const [models, setModels] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRelatedData();
  }, []);

  useEffect(() => {
    if (smartphone) {
      setFormData({
        smartphone_model_id: smartphone.smartphoneModelId || '',
        imei_1: smartphone.imei1 || '',
        distributor_id: smartphone.distributorId || '',
      });
    }
  }, [smartphone]);

  const loadRelatedData = async () => {
    try {
      const [modelsRes, distributorsRes] = await Promise.all([
        smartphoneModelService.getSmartphoneModels(),
        distributorService.getDistributors(),
      ]);
      setModels(modelsRes.data);
      setDistributors(distributorsRes.data);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const smartphoneData = {
        smartphone_model_id: parseInt(formData.smartphone_model_id),
        tag_model: formData.imei_1.slice(0, 8),
        imei_1: formData.imei_1,
        distributor_id: parseInt(formData.distributor_id),
      };
      // Al crear, el estado se guarda automáticamente como 'available'
      if (!smartphone) smartphoneData.status = 'available';

      if (smartphone) {
        await smartphoneService.updateSmartphone(smartphone.smartphonesId, smartphoneData);
        setSuccess('Smartphone actualizado exitosamente!');
      } else {
        await smartphoneService.createSmartphone(smartphoneData);
        setSuccess('Smartphone creado exitosamente!');
      }
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el smartphone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', backgroundColor: 'white', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#1a2340' }}>{smartphone ? 'Editar Smartphone' : 'Agregar Smartphone'}</h2>

      {success && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '10px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="smartphone_model_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Modelo de Smartphone: *
          </label>
          <select
            id="smartphone_model_id"
            name="smartphone_model_id"
            value={formData.smartphone_model_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un modelo</option>
            {models.map(m => (
              <option key={m.smartphoneModelId} value={m.smartphoneModelId}>
                {m.modelName}{m.skuName ? ` — ${m.skuName}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="imei_1" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            IMEI 1: *
          </label>
          <input
            type="text"
            id="imei_1"
            name="imei_1"
            value={formData.imei_1}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="distributor_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Distribuidor: *
          </label>
          <select
            id="distributor_id"
            name="distributor_id"
            value={formData.distributor_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un distribuidor</option>
            {distributors.map(d => (
              <option key={d.distributorId} value={d.distributorId}>{d.distributorName}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: loading ? '#adb5bd' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Guardando...' : (smartphone ? 'Actualizar Smartphone' : 'Agregar Smartphone')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#adb5bd',
              color: 'white',
              border: 'none',
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
  );
}

export default SmartphoneForm;
