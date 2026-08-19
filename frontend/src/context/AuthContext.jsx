import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';

// Module-level: derived from build-time env, so it never changes at runtime and
// does not belong in effect dependency arrays.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/auth/status`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({ username: data.username });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setCurrentUser(null);
  };

  const value = { currentUser, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
