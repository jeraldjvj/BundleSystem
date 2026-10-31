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
        setSuccess('Bandeo actualizado exitosamente!');
      } else {
        await bundleService.createBundle(bundleData);
        setSuccess('Bandeo creado exitosamente!');
      }
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el bandeo');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#333'
  };

  const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#444', fontSize: '0.875rem' };

  return (
    <div style={{ maxWidth: '560px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a2340, #2d3f6e)', padding: '1.5rem 2rem', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{bundle ? 'Editar Bandeo' : 'Crear Nuevo Bandeo'}</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          {bundle ? 'Actualiza los datos del bandeo' : 'Registra un nuevo bandeo en el sistema'}
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {success && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="serial_number" style={labelStyle}>Número de Serie:</label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              required
              placeholder="Ej: 71619/CEAGDF6P403967"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="project_id" style={labelStyle}>Proyecto:</label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="bundle_model_id" style={labelStyle}>Modelo de Bandeo:</label>
            <select
              id="bundle_model_id"
              name="bundle_model_id"
              value={formData.bundle_model_id}
              onChange={handleChange}
              required
              style={inputStyle}
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
                flex: 1, padding: '0.8rem', border: 'none', borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #5470c6, #2d3f6e)',
                color: 'white', fontSize: '1rem', fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(84,112,198,0.3)'
              }}
            >
              {loading ? 'Guardando...' : (bundle ? 'Actualizar Bandeo' : 'Crear Bandeo')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '0.8rem', backgroundColor: 'white', color: '#555',
                border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                fontSize: '1rem', fontWeight: 'bold'
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

export default BundleForm;
