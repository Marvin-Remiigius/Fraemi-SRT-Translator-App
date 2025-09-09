import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  // This effect runs once when the app loads to check for an existing session
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const res = await fetch('http://localhost:5001/auth/status', {
          credentials: 'include', // <-- CRITICAL: Send cookies
        });
        if (res.ok) {
          const data = await res.json();
          if (data.logged_in) {
            setCurrentUser(data);
          }
        }
      } catch (error) {
        console.error('Could not fetch login status:', error);
      } finally {
        setLoading(false); // Stop loading once the check is complete
      }
    };
    checkLoggedInStatus();
  }, []); // Empty array ensures this runs only once on mount

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      // Also call the backend logout endpoint
      await fetch('http://localhost:5001/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading, // Expose loading state
  };

  // Don't render the app until we've checked for a user
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};