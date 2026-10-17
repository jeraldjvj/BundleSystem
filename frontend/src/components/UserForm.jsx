import { useState, useEffect } from 'react';
import { userService } from '../services/api';

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
    profile_picture: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        mi_id: user.miId,
        email: user.email,
        password_hash: '', // Always empty when editing
        status: user.status,
        level_user: user.levelUser,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role_title: user.roleTitle || '',
        date_of_birth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        profile_picture: user.profilePicture || '',
      });
    }
  }, [user]);

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
      const dataToSubmit = { ...formData };
      
      // Si es edición y no se cambió la contraseña, no enviarla
      if (user && !dataToSubmit.password_hash) {
        delete dataToSubmit.password_hash;
      }

      if (user) {
        await userService.updateUser(user.userId, dataToSubmit);
        setMessage('Usuario actualizado exitosamente!');
      } else {
        await userService.createUser(dataToSubmit);
        setMessage('Usuario creado exitosamente!');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError('Error al guardar usuario: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
      <h2>{user ? 'Editar Usuario' : 'Crear Usuario'}</h2>
      
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
          <label htmlFor="mi_id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            MI ID:
          </label>
          <input
            type="text"
            id="mi_id"
            name="mi_id"
            value={formData.mi_id}
            onChange={handleChange}
            required
            disabled={!!user}
            maxLength={10}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: user ? '#f8f9fa' : 'white' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={255}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password_hash" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Contraseña{user ? ' (dejar vacío para mantener actual)' : ''}:
          </label>
          <input
            type="password"
            id="password_hash"
            name="password_hash"
            value={formData.password_hash}
            onChange={handleChange}
            required={!user}
            maxLength={255}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
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
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="level_user" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nivel de Usuario:
          </label>
          <select
            id="level_user"
            name="level_user"
            value={formData.level_user}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="Field Force">Field Force</option>
            <option value="City Manager">City Manager</option>
            <option value="Office Manager">Office Manager</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem', marginTop: '1.5rem', borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#495057', fontSize: '1rem' }}>Información del Perfil</h3>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="first_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nombre:
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            maxLength={50}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="last_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Apellido:
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            maxLength={60}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="role_title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Título del Rol:
          </label>
          <input
            type="text"
            id="role_title"
            name="role_title"
            value={formData.role_title}
            onChange={handleChange}
            required
            maxLength={45}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="date_of_birth" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Fecha de Nacimiento:
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="profile_picture" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            URL de Foto de Perfil (opcional):
          </label>
          <input
            type="text"
            id="profile_picture"
            name="profile_picture"
            value={formData.profile_picture}
            onChange={handleChange}
            maxLength={255}
            placeholder="https://ejemplo.com/foto.jpg"
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
            {user ? 'Actualizar' : 'Crear'}
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

export default UserForm;
