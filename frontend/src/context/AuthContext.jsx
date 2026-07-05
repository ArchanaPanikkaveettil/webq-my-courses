import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("accessToken"));

  const login = (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          // Call me/ endpoint to verify token and retrieve user details
          const response = await api.get("me/");
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}