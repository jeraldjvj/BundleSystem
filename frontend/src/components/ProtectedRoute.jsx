import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
