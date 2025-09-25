
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [connectionError, setConnectionError] = useState('');

  const { login, loading, error, clearError } = useAuth();

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 5000,
      });
      setConnectionError('');
    } catch (error) {
      setConnectionError(
        `Cannot connect to backend at ${import.meta.env.VITE_BACKEND_URL}`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error || connectionError) {
      clearError();
      setConnectionError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      username: formData.username.trim(),
      password: formData.password,
    };

    if (userType === 'user') {
      loginData.email = formData.email.trim();
    }

    console.log('🔄 Attempting login with:', {
      userType,
      username: loginData.username,
      hasEmail: !!loginData.email,
    });

    const result = await login(loginData, userType);

    if (result.success) {
      console.log('✅ Login successful');
      // Redirect or handle success
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
    });
    clearError();
    setConnectionError('');
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    resetForm();
  };

  // Sample admin credentials hint
  const getAdminHint = () => {
    if (userType === 'admin') {
      return (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">Admin Login Help:</p>
          <p className="text-xs text-blue-600 mt-1">
            • Check if admin account exists in database
            <br />
            • Common credentials: admin/admin123
            <br />
            • Username/password are case-sensitive
            <br />• Contact system administrator for credentials
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-white px-4 py-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {userType === 'admin' ? 'Admin Login' : 'User Login'}
        </h2>

        {connectionError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-700 text-sm">{connectionError}</span>
            </div>
          </div>
        )}

        <div className="flex mb-6 rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-3 px-4 font-medium transition-all duration-300 ${
              userType === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleUserTypeChange('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 font-medium transition-all duration-300 ${
              userType === 'admin'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleUserTypeChange('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
              {error.includes('Invalid admin credentials') && (
                <p className="text-xs mt-2">
                  Please check your username and password
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
              disabled={loading}
              placeholder={
                userType === 'admin'
                  ? 'Enter admin username'
                  : 'Enter your username'
              }
            />
          </div>

          {userType === 'user' && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          {getAdminHint()}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              `Login as ${userType === 'admin' ? 'Admin' : 'User'}`
            )}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Login Type:</strong> {userType}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Status:</strong>{' '}
            {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;