
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  // 1. If the authentication check is still loading, show a loading message.
  //    This is the key to preventing the race condition.
  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-white text-xl">Loading...</p>
        </div>
    );
  }

  // 2. If loading is finished and there is a user, show the requested page.
  //    The <Outlet /> component renders the child route (e.g., DashboardPage).
  if (currentUser) {
    return <Outlet />;
  }

  // 3. If loading is finished and there is NO user, redirect to the sign-in page.
  return <Navigate to="/signin" />;
};

export default ProtectedRoute;