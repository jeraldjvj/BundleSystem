import { useState, useEffect } from 'react';
import { projectService } from '../services/api';

function ProjectForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    project_name: '',
    start_date: '',
    status: 'active',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.projectName,
        start_date: project.startDate ? project.startDate.split('T')[0] : '',
        status: project.status || 'active',
      });
    }
  }, [project]);

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
      if (project) {
        await projectService.updateProject(project.projectId, formData);
        setMessage('Proyecto actualizado exitosamente!');
      } else {
        await projectService.createProject(formData);
        setMessage('Proyecto creado exitosamente!');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar proyecto: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#1a2340' }}>{project ? 'Editar Proyecto' : 'Crear Proyecto'}</h2>
      
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
          <label htmlFor="project_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nombre del Proyecto:
          </label>
          <input
            type="text"
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            required
            maxLength={60}
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="start_date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Fecha de Inicio:
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Estado:
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
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
            {project ? 'Actualizar' : 'Crear'}
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

export default ProjectForm;
