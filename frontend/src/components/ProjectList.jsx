import { useState, useEffect } from 'react';
import { projectService } from '../services/api';

function ProjectList({ onEdit, onRefresh }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [onRefresh]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (err) {
      setError('Error al cargar proyectos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectService.deleteProject(deletingProject.projectId);
      setDeletingProject(null);
      loadProjects();
    } catch (err) {
      setError('Error al eliminar proyecto: ' + err.message);
      setDeletingProject(null);
    } finally {
      setDeleting(false);
    }
  };

  const actionBtn = {
    padding: '0.4rem', borderRadius: '8px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginRight: '0.4rem', border: '1px solid', backgroundColor: 'transparent'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '1rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', backgroundColor: 'white', borderRadius: '16px' }}>
          No hay proyectos registrados
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>ID</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Nombre</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Fecha de Inicio</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Estado</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center', fontWeight: 'bold', color: '#495057', fontSize: '0.85rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.projectId} style={{ borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#1a2340', fontWeight: 600, fontSize: '0.9rem' }}>{project.projectId}</td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>{project.projectName}</td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#333', fontSize: '0.9rem' }}>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                      backgroundColor: project.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: project.status === 'active' ? '#155724' : '#721c24',
                      border: `1px solid ${project.status === 'active' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                      {project.status === 'active' ? 'Active' : (project.status || '-')}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => onEdit(project)}
                      title="Editar"
                      style={{ ...actionBtn, color: '#007bff', borderColor: '#007bff' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3-3L18.5 2.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingProject(project)}
                      title="Eliminar"
                      style={{ ...actionBtn, color: '#dc3545', borderColor: '#dc3545', marginRight: 0 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingProject && (
        <div
          onClick={() => !deleting && setDeletingProject(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '2rem',
              maxWidth: '380px', width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1rem',
              backgroundColor: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Eliminar proyecto?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a eliminar <strong>{deletingProject.projectName}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingProject(null)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '0.7rem', backgroundColor: 'white', color: '#555',
                  border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px',
                  backgroundColor: '#dc3545', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectList;
