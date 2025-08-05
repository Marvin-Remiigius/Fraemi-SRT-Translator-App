import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="">
    </svg>
    <span className="ml-2 text-2xl font-bold text-white tracking-tighter">FRAEMI VISION</span>
  </div>
);


const Header = () => {
  return (
    <div className="w-100% flex justify-center p-4 ">
      <nav className="w-350 h-30 flex items-center gap-8 bg-blue-950 backdrop-blur-sm rounded-full px-6 py-2.5">
        <a href="#">
            <Logo />
        </a>

        <div className="flex items-center gap-6">
          
          <ul className="flex items- gap-5 text-neutral-300 text-sm">
             <li>
              <a href="#" className="hover:text-white transition-colors">ABOUT US</a>
            </li>
            </ul>
          <div className="flex items justify-end gap-3 text-neutral-300 text-sm">
            <button className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
              SIGN IN
            </button>
            <button className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
              SIGN UP
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;