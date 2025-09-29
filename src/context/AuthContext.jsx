

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
      console.log(data);
      

      const payload =
        role === "admin"
          ? {
              role: "admin",
              username: credentials.username,
              token: data?.accessToken,
            }
          : {
              role: "user",
              token: data?.accessToken,
              name: data?.user?.name,
              _id: data?.user?._id,
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
