import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Hydrate from localStorage
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
      const endpoint =
        role === "admin" ? "/auth/admin/login" : "/auth/user/login";
      const url = `${BACKEND_URL}${endpoint}`;

      const { data } = await axios.post(url, credentials, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

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
              team: data?.user?.team,
            };

      setUser(payload);
      localStorage.setItem("user", JSON.stringify(payload));
      return { success: true, user: payload };
    } catch (e) {
      const errMsg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e.message ||
        "Login failed";
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout (clears user + redirects)
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Axios interceptor to catch token expiry
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          console.warn("Token expired — logging out");
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authLoading,
        error,
        clearError,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
