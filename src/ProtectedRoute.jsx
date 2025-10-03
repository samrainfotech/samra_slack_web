
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role mismatch → redirect to appropriate dashboard instead of login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Instead of going to login, redirect to user's actual dashboard
    const redirectPath = user.role === 'admin' ? '/admin' : '/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;