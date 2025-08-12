
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const AppHeader = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); 

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 p-4">
        <nav className="flex w-full max-w-[1200px] items-center justify-between rounded-full mx-auto px-6 py-2.5 
                     bg-gradient-to-b from-neutral-800/90 to-neutral-900/90 border-t border-white/20">
          
          <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center gap-3">
            <img className='h-16 w-16 rounded-full' src="/Logo.png" alt="Fraemi Vision Logo" />
            <span className="text-4xl font-bold text-white tracking-tighter">FRAEMI VISION</span>
          </Link>

          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-5 text-neutral-300 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">ABOUT US</Link>
              </li>
            </ul>
            {currentUser ? (
              <>
                <span className="text-gray-300">Welcome, {currentUser.username}!</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <button className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
                    SIGN IN 
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
                    SIGN UP
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
  );
};

export default AppHeader;
