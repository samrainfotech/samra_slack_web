import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
// import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from './pages/admin/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './ProtectedRoute';
import UserDashboard from './pages/user/UserDashboard';
// import ProtectedRoute from "./ProtectedRoute";
// import ProtectedRoute from "./components/ProtectedRoute"; // import

function App() {
  const { user } = useAuth();

  return (
    <div>
      <Router>
        <SocketProvider>
          <Toaster />
          <Routes>
          {/* Default: redirect root to correct dashboard or login */}
          <Route path="/" element={<Login />} />

          {/* Login should redirect if already logged in */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.role === 'admin' ? '/admin' : '/user'}
                  replace
                />
              ) : (
                <Login />
              )
            }
          />

          {/* Protected Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all unknown routes */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  user ? (user.role === 'admin' ? '/admin' : '/user') : '/login'
                }
                replace
              />
            }
          />
          </Routes>
        </SocketProvider>
      </Router>
    </div>
  );
}

export default App;
