import { useState, useEffect } from 'react';
import { userService, bundleDeliveredService } from '../services/api';

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

const sectionStyle = {
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid #eee'
};

const sectionTitle = { margin: '0 0 1rem', color: '#1a2340', fontSize: '1rem', fontWeight: 'bold' };

function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    mi_id: '',
    email: '',
    password_hash: '',
    status: 'active',
    level_user: 'field force',
    first_name: '',
    last_name: '',
    role_title: '',
    date_of_birth: '',
    city: '',
    head_in_charge: '',
    profile_picture: '',
  });

  const [managers, setManagers] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadManagers = async () => {
      try {
        const response = await userService.getUsers();
        setManagers(response.data.filter(u => u.levelUser === 'City Manager' || u.levelUser === 'Office Manager'));
      } catch (err) {
        console.error('Error al cargar encargados:', err);
      }
    };
    loadManagers();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        mi_id: user.miId,
        email: user.email,
        password_hash: '',
        status: user.status,
        level_user: user.levelUser,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role_title: user.roleTitle || '',
        date_of_birth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        city: user.city || '',
        head_in_charge: user.headInCharge || '',
        profile_picture: user.profilePicture || '',
      });
      if (user.profilePicture) {
        setPhotoPreview(user.profilePicture.startsWith('http')
          ? user.profilePicture
          : `http://localhost:3000/uploads/${user.profilePicture}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const initials = ((formData.first_name?.charAt(0) || '') + (formData.last_name?.charAt(0) || '')).toUpperCase() || 'U';

  const handleDelete = async () => {
    setSaving(true);
    try {
      await userService.deleteUser(user.userId);
      onSave();
    } catch (err) {
      setError('Error al eliminar usuario: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const dataToSubmit = { ...formData };

      if (user && !dataToSubmit.password_hash) {
        delete dataToSubmit.password_hash;
      }

      // Subir foto de perfil si se seleccionó una nueva
      if (photoFile) {
        const up = await bundleDeliveredService.uploadPicture(photoFile);
        dataToSubmit.profile_picture = up.data.client_picture.replace(/^uploads\//, '');
      }

      if (user) {
        await userService.updateUser(user.userId, dataToSubmit);
        setMessage('Usuario actualizado exitosamente!');
      } else {
        await userService.createUser(dataToSubmit);
        setMessage('Usuario creado exitosamente!');
      }

      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError('Error al guardar usuario: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      maxWidth: '620px',
      margin: '2rem auto',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header degradado */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2340, #2d3f6e)',
        padding: '1.5rem 2rem',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{user ? 'Editar Usuario' : 'Crear Usuario'}</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
          {user ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {message && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Foto de perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Perfil"
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #5470c6', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '1.4rem', border: '3px solid #e0e0e0'
              }}>
                {initials}
              </div>
            )}
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Foto de Perfil (opcional)</label>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 1rem', backgroundColor: '#eef2fb', color: '#2d3f6e',
                borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                border: '1px solid #c7d3f0'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                {photoFile || photoPreview ? 'Cambiar foto' : 'Subir o tomar foto'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#999' }}>Desde la galería o la cámara del dispositivo</p>
            </div>
          </div>

          {/* Cuenta */}
          <h3 style={sectionTitle}>Datos de la Cuenta</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="mi_id" style={labelStyle}>MI ID:</label>
              <input type="text" id="mi_id" name="mi_id" value={formData.mi_id} onChange={handleChange}
                required disabled={!!user} maxLength={10}
                style={{ ...inputStyle, backgroundColor: user ? '#ececec' : '#f8f9fa', color: user ? '#777' : '#333' }} />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                required maxLength={255} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="password_hash" style={labelStyle}>Contraseña{user ? ' (vacío = sin cambio)' : ''}:</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} id="password_hash" name="password_hash" value={formData.password_hash}
                  onChange={handleChange} required={!user} maxLength={255} style={{ ...inputStyle, paddingRight: '2.75rem' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                    display: 'inline-flex', alignItems: 'center', color: '#888'
                  }}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="status" style={labelStyle}>Estado:</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="level_user" style={labelStyle}>Nivel de Usuario:</label>
              <select id="level_user" name="level_user" value={formData.level_user} onChange={handleChange} style={inputStyle}>
                <option value="Field Force">Field Force</option>
                <option value="City Manager">City Manager</option>
                <option value="Office Manager">Office Manager</option>
              </select>
            </div>
          </div>

          {/* Perfil */}
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>Información del Perfil</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="first_name" style={labelStyle}>Nombre:</label>
                <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange}
                  required maxLength={50} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="last_name" style={labelStyle}>Apellido:</label>
                <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange}
                  required maxLength={60} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="role_title" style={labelStyle}>Título del Rol:</label>
                <input type="text" id="role_title" name="role_title" value={formData.role_title} onChange={handleChange}
                  required maxLength={45} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="date_of_birth" style={labelStyle}>Fecha de Nacimiento:</label>
                <div style={{ position: 'relative' }}>
                  <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth}
                    onChange={handleChange} required
                    style={{ ...inputStyle, paddingRight: '2.4rem', colorScheme: 'light' }} />
                  <span
                    onClick={() => document.getElementById('date_of_birth')?.showPicker?.()}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#5470c6', cursor: 'pointer', display: 'flex' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="city" style={labelStyle}>Ciudad:</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                  required maxLength={45} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="head_in_charge" style={labelStyle}>Encargado:</label>
                <select id="head_in_charge" name="head_in_charge" value={formData.head_in_charge}
                  onChange={handleChange} required style={inputStyle}>
                  <option value="">Selecciona un encargado</option>
                  {managers.map(m => {
                    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
                    return (
                      <option key={m.userId} value={fullName}>
                        {fullName} ({m.levelUser})
                      </option>
                    );
                  })}
                  {formData.head_in_charge && !managers.some(m => `${m.firstName || ''} ${m.lastName || ''}`.trim() === formData.head_in_charge) && (
                    <option value={formData.head_in_charge}>{formData.head_in_charge}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '0.8rem', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving ? '#6c757d' : 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white',
              fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(84,112,198,0.3)'
            }}>
              {saving ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
            </button>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '0.8rem', backgroundColor: 'white', color: '#555',
              border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'
            }}>
              Cancelar
            </button>
          </div>

          {user && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} disabled={saving} style={{
              width: '100%', marginTop: '0.75rem', padding: '0.8rem',
              backgroundColor: 'transparent', color: '#dc3545',
              border: '1px solid #dc3545', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Eliminar Usuario
            </button>
          )}
        </form>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          onClick={() => !saving && setShowDeleteConfirm(false)}
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
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem' }}>¿Eliminar usuario?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.9rem' }}>
              Vas a eliminar a <strong>{formData.first_name} {formData.last_name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
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
                disabled={saving}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px',
                  backgroundColor: '#dc3545', color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9rem'
                }}
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserForm;
