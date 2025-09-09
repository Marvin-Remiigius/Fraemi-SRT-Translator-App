import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect now runs once to check localStorage for a persistent session.
  useEffect(() => {
    try {
      // 1. Check browser's localStorage for user data.
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        // If found, parse it and set it as the current user.
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      // 2. We are done checking, so stop the loading state.
      setLoading(false);
    }
  }, []); // Empty array ensures this runs only once on app load

  const login = (userData) => {
    // 1. Set the user in the React state.
    setCurrentUser(userData);
    // 2. Save the user data to localStorage as a string.
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Still call the backend to invalidate the server session.
      await fetch('http://localhost:5001/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    // 1. Clear the user from the React state.
    setCurrentUser(null);
    // 2. Remove the user data from localStorage.
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  // The ProtectedRoute will now work correctly because it waits for this
  // initial localStorage check to complete.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

