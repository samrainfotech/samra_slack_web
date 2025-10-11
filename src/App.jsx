import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const { user } = useAuth();

  return (
    <SocketProvider>
      <Toaster />
      <Routes>
        {/*  Default root → redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/user"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/*  Login route */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/user"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/*  Catch-all */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? user.role === "admin"
                    ? "/admin"
                    : "/user"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </SocketProvider>
  );
}

export default App;
