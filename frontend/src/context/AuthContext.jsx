import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const savedToken = localStorage.getItem('referx_token') || localStorage.getItem('token');
  const savedUser = localStorage.getItem('referx_user') || localStorage.getItem('user');
  const savedRole = localStorage.getItem('referx_role') || localStorage.getItem('role');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [token, setToken] = useState(savedToken);
  const [role, setRole] = useState(savedRole);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (user) {
        setLoading(false);
        return;
      }
      api.get('/users/profile')
        .then(r => {
          setUser(r.data);
          localStorage.setItem('referx_user', JSON.stringify(r.data));
          localStorage.setItem('referx_role', r.data.role);
          setRole(r.data.role);
        })
        .catch(() => {
          localStorage.removeItem('referx_token');
          localStorage.removeItem('referx_user');
          localStorage.removeItem('referx_role');
          setToken(null);
          setUser(null);
          setRole(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (tokenValue, userData) => {
    localStorage.setItem('referx_token', tokenValue);
    localStorage.setItem('referx_role', userData.role);
    localStorage.setItem('referx_user', JSON.stringify(userData));
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
    setToken(tokenValue);
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.removeItem('referx_token');
    localStorage.removeItem('referx_role');
    localStorage.removeItem('referx_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
