
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const { login, user, error, clearError, authLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [form, setForm] = useState({ username: "", password: ""});
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  // Auto redirect if logged in
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
    if (user?.role === 'user') navigate('/user', { replace: true });
  }, [user]);

  // Test backend availability
  useEffect(() => {
    const testBackend = async () => {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        setConnectionError('');
      } catch {
        setConnectionError(
          `Cannot connect to backend at ${import.meta.env.VITE_BACKEND_URL}`
        );
      }
    };
    testBackend();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error || connectionError) {
      clearError();
      setConnectionError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const credentials = {
      username: form.username.trim(),
      password: form.password,
    };
    const result = await login(role, credentials);
    setLoading(false);

    if (result.success) {
      toast.success('Login successfully');
      console.log(result);

      console.log("Login response:", result);

      
      navigate(role === "admin" ? "/admin" : "/user");

    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };
  const handleRoleChange = (type) => {
    setRole(type);
    setForm({ username: "", password: ""});
    clearError();
    setConnectionError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-white px-4 py-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {role === 'admin' ? 'Admin Login' : 'User Login'}
        </h2>

        {connectionError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            {connectionError}
          </div>
        )}

        <div className="flex mb-6 rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-3 px-4 font-medium transition-all ${
              role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleRoleChange('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 font-medium transition-all ${
              role === 'admin'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
              placeholder={
                role === 'admin'
                  ? 'Enter admin username'
                  : 'Enter your username'
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading || authLoading ? 'Logging in...' : `Login as ${role}`}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p>
            <strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL}
          </p>
          <p className="mt-1">
            <strong>Login Type:</strong> {role}
          </p>
          <p className="mt-1">
            <strong>Status:</strong>{' '}
            {loading || authLoading ? 'Loading...' : error ? 'Error' : 'Ready'}
          </p>
        </div>
      </div>
    </div>
  );
}
