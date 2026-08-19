import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p className="font-mono text-6xl font-extrabold text-brand">404</p>
    <h1 className="mt-4 text-2xl font-bold text-white">This page doesn’t exist</h1>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
      The link may be broken, or the page may have been moved.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm
                 font-semibold text-black transition-colors hover:bg-brand-soft"
    >
      <ArrowLeft size={16} /> Back to home
    </Link>
  </div>
);

export default NotFound;
