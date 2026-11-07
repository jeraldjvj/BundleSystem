import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Ventana obligatoria: aparece cuando el usuario inicia sesión con una contraseña temporal
function ForcePasswordChange() {
  const { user, tempPassword, completePasswordChange, logout } = useAuth();
  // Si la sesión se recargó, la contraseña temporal ya no está en memoria y se pide de nuevo
  const needsCurrent = !tempPassword;
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const current = needsCurrent ? form.current : tempPassword;
    if (!current || !form.next) return setError('Completa todos los campos');
    if (form.next.length < 6) return setError('La nueva contraseña debe tener al menos 6 caracteres');
    if (form.next !== form.confirm) return setError('La confirmación no coincide con la nueva contraseña');
    setBusy(true);
    try {
      await authService.changePassword(current, form.next);
      setSuccess('Contraseña actualizada. Bienvenido(a).');
      setTimeout(completePasswordChange, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar la contraseña');
      setBusy(false);
    }
  };

  const fields = [
    ...(needsCurrent ? [['current', 'Contraseña temporal', 'current-password']] : []),
    ['next', 'Nueva contraseña', 'new-password'],
    ['confirm', 'Confirmar nueva contraseña', 'new-password'],
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      background: 'linear-gradient(135deg, #1a2340 0%, #2d3f6e 100%)', boxSizing: 'border-box'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '2rem 1.75rem',
          maxWidth: '420px', width: '100%', boxSizing: 'border-box',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1rem',
          backgroundColor: '#eef2fb', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5470c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3 style={{ margin: '0 0 0.4rem', color: '#1a2340', fontSize: '1.2rem', textAlign: 'center' }}>
          Crea tu nueva contraseña
        </h3>
        <p style={{ margin: '0 0 1.5rem', color: '#666', fontSize: '0.88rem', textAlign: 'center' }}>
          Hola {user?.firstName || ''}, ingresaste con una contraseña temporal. Para continuar, elige una contraseña nueva.
        </p>

        {fields.map(([key, label, auto]) => (
          <div key={key} style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#444', fontSize: '0.85rem' }}>{label}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show[key] ? 'text' : 'password'}
                autoComplete={auto}
                value={form[key]}
                onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={busy}
                required
                style={{
                  width: '100%', padding: '0.65rem 2.6rem 0.65rem 0.85rem', border: '1px solid #e0e0e0', borderRadius: '10px',
                  fontSize: '0.95rem', backgroundColor: '#f8f9fa', color: '#333', colorScheme: 'light',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                title={show[key] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShow(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                  color: '#888', display: 'flex', alignItems: 'center'
                }}
              >
                <EyeIcon open={show[key]} />
              </button>
            </div>
          </div>
        ))}

        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#888' }}>
          Mínimo 6 caracteres y diferente a la contraseña temporal.
        </p>

        {error && (
          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.85rem', marginBottom: '0.9rem' }}>{error}</div>
        )}
        {success && (
          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', backgroundColor: '#d4edda', color: '#155724', fontSize: '0.85rem', marginBottom: '0.9rem' }}>{success}</div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #5470c6, #2d3f6e)', color: 'white',
            border: 'none', borderRadius: '10px', cursor: busy ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
            opacity: busy ? 0.7 : 1
          }}
        >
          {busy ? 'Guardando…' : 'Guardar nueva contraseña'}
        </button>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          style={{
            width: '100%', marginTop: '0.6rem', padding: '0.6rem', background: 'none', border: 'none',
            color: '#888', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
          }}
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

export default ForcePasswordChange;
