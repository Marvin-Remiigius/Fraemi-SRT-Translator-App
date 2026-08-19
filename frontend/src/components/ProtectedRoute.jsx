import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

// AuthProvider withholds its children until the session check resolves, so by
// the time this renders currentUser is already settled.
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;
