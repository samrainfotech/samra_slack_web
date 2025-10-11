import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  //  No token → redirect
  if (!user || !user.token) return <Navigate to="/login" replace />;

  //  Role mismatch
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === "admin" ? "/admin" : "/user";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
