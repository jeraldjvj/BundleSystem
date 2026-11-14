import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Contraseña temporal recién usada para iniciar sesión (solo en memoria, nunca en localStorage)
  const [tempPassword, setTempPassword] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      setUser(response.data);
      setTempPassword(response.data.mustChangePassword ? password : '');
      localStorage.setItem('user', JSON.stringify(response.data));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marca que el usuario ya reemplazó su contraseña temporal
  const completePasswordChange = () => {
    setTempPassword('');
    setUser(prev => {
      const updated = { ...prev, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    // Invalida el token en el servidor (cierra todas las sesiones del usuario);
    // si falla la red igual se limpia la sesión local
    authService.logout().catch(() => {});
    setUser(null);
    setTempPassword('');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, tempPassword, completePasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
