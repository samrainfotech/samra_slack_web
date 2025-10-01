
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');

//     if (token && userData) {
//       setUser(JSON.parse(userData));
//     }
//   }, []);

//   const login = async (loginData, userType) => {
//     setLoading(true);
//     setError('');

//     try {
//       const endpoint =
//         userType === 'admin' ? '/auth/admin/login' : '/auth/user/login';
//       const url = `${BACKEND_URL}${endpoint}`;

//       console.log('Login attempt:', { url, loginData, userType });

//       const response = await axios.post(url, loginData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000, // 10 second timeout
//       });

//       const data = response.data;

//       // Store token and user data
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify(data.user));
//       setUser(data.user);

//       return { success: true, user: data.user };
//     } catch (error) {
//       console.error('Login error details:', error);

//       let errorMessage = 'Login failed';

//       if (error.response) {
//         // Server responded with error status
//         errorMessage =
//           error.response.data?.message ||
//           error.response.data?.error ||
//           `Server error: ${error.response.status}`;

//         // Log detailed error info for debugging
//         console.log('Error response data:', error.response.data);
//         console.log('Error status:', error.response.status);
//       } else if (error.request) {
//         // No response received
//         errorMessage = `Cannot connect to server. Please check if the backend is running on ${BACKEND_URL}`;
//       } else {
//         // Other errors
//         errorMessage = error.message;
//       }

//       setError(errorMessage);
//       return { success: false, error: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     setError('');
//   };

//   const clearError = () => setError('');

//   const value = {
//     user,
//     login,
//     logout,
//     loading,
//     error,
//     clearError,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {role, token, name?, _id?, username?}
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const clearError = () => setError("");

  const login = async (role, credentials) => {
    setAuthLoading(true);
    setError("");
    try {
      const endpoint = role === "admin" ? "/auth/admin/login" : "/auth/user/login";
      const url = `${BACKEND_URL}${endpoint}`;

      const { data } = await axios.post(url, credentials, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });
      console.log("axs",data);
      

      const payload =
        role === "admin"
          ? {
              role: "admin",
              username: credentials.username,
              token: data?.accessToken,
              id: data.user.id,
            }
          : {
              role: "user",
              token: data?.accessToken,
              name: data?.user?.username,
              _id: data?.user?.id,
            };

      setUser(payload);
      console.log(payload);
      
      localStorage.setItem("user", JSON.stringify(payload));
      return { success: true, user: payload };
    } catch (e) {
      const errMsg = e?.response?.data?.message || e?.response?.data || e.message || "Login failed";
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.role === "user") {
      }
    } catch (_) {
      // ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authLoading, error, clearError, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
