import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log('User signed out.');

    navigate('/');
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold tracking-tighter">
          FRAEMI VISION
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Welcome, Joy!</span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;