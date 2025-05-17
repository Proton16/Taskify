// src/components/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 🔁

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');

    if (storedToken) {
      setToken(storedToken);
      setEmail(storedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setToken(token);
    setEmail(email);
    setIsAuthenticated(true);
    setRefreshTrigger(prev => prev + 1); // 🔁 trigger refresh
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
    setIsAuthenticated(false);
    setRefreshTrigger(prev => prev + 1); // 🔁 trigger refresh
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, email, login, logout, refreshTrigger }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);