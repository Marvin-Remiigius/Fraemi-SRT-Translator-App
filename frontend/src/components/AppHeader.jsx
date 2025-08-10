import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- IMPORT THE CONTEXT

const AppHeader = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // <-- GET THE CURRENT USER AND LOGOUT FUNCTION

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold tracking-tighter">
          FRAEMI VISION
        </Link>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* This is now dynamic! */}
              <span className="text-gray-400">Welcome, {currentUser.username}!</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            // You can add a Sign In link here for when no one is logged in
            <Link to="/signin" className="text-gray-400 hover:text-white">Sign In</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;