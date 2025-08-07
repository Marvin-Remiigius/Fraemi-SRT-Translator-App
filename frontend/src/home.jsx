import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="flex w-full justify-center p-4">

      <nav className="flex w-full max-w-[1200px] h-23 items-center justify-between bg-black backdrop-blur-sm rounded-full px-6 py-2.5">
        
        <a href="/" className="flex items-center gap-3">

          <img className='h-10 w-10 rounded-full' src="/Logo.png" alt="Fraemi Vision Logo" />
          <span className="text-2xl font-bold text-white tracking-tighter">FRAEMI VISION</span>
        </a>

        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-5 text-neutral-300 text-sm">
            <li>
              <a href="/about" className="hover:text-white transition-colors">ABOUT US</a>
            </li>
          </ul>
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
        </div>

      </nav>
    </div>
  );
};

export default Header;