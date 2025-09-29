import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChannelProvider } from './context/ChannelContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './ProtectedRoute';
import UserDashboard from './pages/user/UserDashboard';

// Move the router content to a separate component that uses useAuth
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Default: redirect root to correct dashboard or login */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
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
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChannelProvider>
        <AppRoutes />
      </ChannelProvider>
    </AuthProvider>
  );
}

export default App;
