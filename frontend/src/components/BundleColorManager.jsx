import { useState, useEffect } from 'react';
import { bundleColorService, bundleModelService } from '../services/api';
import BundleColorForm from './BundleColorForm';

function BundleColorManager({ bundleModel, onClose, onColorsAdded, singleSelect = false }) {
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      setLoading(true);
      const response = await bundleColorService.getBundleColors();
      setColors(response.data);
      
      if (bundleModel) {
        setSelectedColors(bundleModel.colors || []);
      }
    } catch (err) {
      setError('Error al cargar colores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleColor = (colorId) => {
    if (singleSelect) {
      // En modo singleSelect, no hacer nada (solo vista)
      return;
    }
    
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
    setShowColorForm(true);
  };

  const handleCreateColor = () => {
    setEditingColor(null);
    setShowColorForm(true);
  };

  const handleColorSaved = () => {
    setShowColorForm(false);
    setEditingColor(null);
    loadColors();
  };

  const handleDeleteColor = async (colorId) => {
    if (!window.confirm('¿Estás seguro de eliminar este color?')) return;
    
    try {
      await bundleColorService.deleteBundleColor(colorId);
      loadColors();
    } catch (err) {
      setError('Error al eliminar color: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!singleSelect && selectedColors.length === 0) {
      setError('Selecciona al menos un color');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (singleSelect) {
        // En modo selección única, no hace nada (ya se seleccionó al hacer clic)
        return;
      }
      onColorsAdded(selectedColors);
      onClose();
    } catch (err) {
      setError('Error al guardar colores: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando colores...</div>;

  return (
    <div style={{ 
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 2000,
      maxWidth: singleSelect ? '600px' : '800px',
      width: '90%',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#333' }}>
          {singleSelect ? 'Colores del Bandeo' : 'Gestionar Colores del Bandeo'}
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showColorForm ? (
        <BundleColorForm
          color={editingColor}
          onSave={handleColorSaved}
          onCancel={() => setShowColorForm(false)}
        />
      ) : (
        <>
          {singleSelect && bundleModel && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Bundle: {bundleModel.bundleName}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Colores disponibles para este bundle</p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#495057', fontSize: '1rem' }}>
                {singleSelect ? 'Colores Disponibles:' : 'Colores Disponibles:'}
              </h3>
              <button
                onClick={handleCreateColor}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                + Nuevo Color
              </button>
            </div>
            
            {colors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                No hay colores registrados.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {colors.map((color) => (
                  <div
                    key={color.bundleColorId}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${bundleModel?.bundleColorId === color.bundleColorId ? '#007bff' : '#dee2e6'}`,
                      borderRadius: '4px',
                      cursor: singleSelect ? 'default' : 'pointer',
                      backgroundColor: bundleModel?.bundleColorId === color.bundleColorId ? '#e7f1ff' : 'white',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>{color.colorNameEng}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>{color.colorNameSpa}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditColor(color);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColor(color.bundleColorId);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!singleSelect && (
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Colores seleccionados: {selectedColors.length}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedColors.map((colorId) => {
                  const color = colors.find(c => c.bundleColorId === colorId);
                  return color ? (
                    <span
                      key={colorId}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {color.colorNameEng}
                      <button
                        onClick={() => toggleColor(colorId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
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
            {!singleSelect && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BundleColorManager;
