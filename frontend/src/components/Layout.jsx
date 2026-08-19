import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AppHeader from './AppHeader';

const Layout = () => (
  <div className="flex min-h-screen flex-col">
    <AppHeader />

    <main className="flex-1">
      <Outlet />
    </main>

    <footer className="border-t border-line px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-dim sm:flex-row">
        <p>© {new Date().getFullYear()} Fraemi Vision. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link to="/about" className="transition-colors hover:text-neutral-200">
            About
          </Link>
          <a
            href="https://fraemivision.in"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-neutral-200"
          >
            fraemivision.in
          </a>
        </div>
      </div>
    </footer>
  </div>
);

export default Layout;
