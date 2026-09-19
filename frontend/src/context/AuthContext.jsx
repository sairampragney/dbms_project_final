import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('disaster_app_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res.data && res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to load user session:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    if (res.data && res.data.success) {
      const { user: userProfile, token: jwtToken } = res.data.data;
      localStorage.setItem('disaster_app_token', jwtToken);
      setToken(jwtToken);
      setUser(userProfile);
      return userProfile;
    }
    throw new Error(res.data?.error?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    if (res.data && res.data.success) {
      const { user: userProfile, token: jwtToken } = res.data.data;
      localStorage.setItem('disaster_app_token', jwtToken);
      setToken(jwtToken);
      setUser(userProfile);
      return userProfile;
    }
    throw new Error(res.data?.error?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('disaster_app_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
