import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // role mismatch → block access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
