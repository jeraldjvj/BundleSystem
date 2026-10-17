import { useState, useEffect } from 'react';
import { bundleService, projectService, bundleModelService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BundleForm({ bundle, onSave, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    serial_number: '',
    project_id: '',
    bundle_model_id: '',
  });
  const [projects, setProjects] = useState([]);
  const [bundleModels, setBundleModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRelatedData();
  }, []);

  useEffect(() => {
    if (bundle) {
      setFormData({
        serial_number: bundle.serialNumber || '',
        project_id: bundle.projectId || '',
        bundle_model_id: bundle.bundleModelId || '',
      });
    }
  }, [bundle]);

  const loadRelatedData = async () => {
    try {
      const [projectsRes, modelsRes] = await Promise.all([
        projectService.getProjects(),
        bundleModelService.getBundleModels(),
      ]);
      setProjects(projectsRes.data);
      setBundleModels(modelsRes.data);
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
      const bundleData = {
        serial_number: formData.serial_number,
        project_id: parseInt(formData.project_id),
        user_id: bundle ? bundle.userId : user.userId,
        bundle_model_id: parseInt(formData.bundle_model_id),
        create_time: new Date().toISOString(),
      };

      if (bundle) {
        await bundleService.updateBundle(bundle.bundleId, bundleData);
        setSuccess('Bundle actualizado exitosamente!');
      } else {
        await bundleService.createBundle(bundleData);
        setSuccess('Bundle creado exitosamente!');
      }
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el bundle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', width: '100%', boxSizing: 'border-box' }}>
      <h2>{bundle ? 'Editar Bundle' : 'Crear Nuevo Bundle'}</h2>

      {success && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="serial_number" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Número de Serie: *
          </label>
          <input
            type="text"
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="project_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Proyecto: *
          </label>
          <select
            id="project_id"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="bundle_model_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Modelo de Bundle: *
          </label>
          <select
            id="bundle_model_id"
            name="bundle_model_id"
            value={formData.bundle_model_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un modelo</option>
            {bundleModels.map(bm => (
              <option key={bm.bundleModelId} value={bm.bundleModelId}>{bm.bundleName}</option>
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
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Guardando...' : (bundle ? 'Actualizar Bundle' : 'Crear Bundle')}
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

export default BundleForm;
