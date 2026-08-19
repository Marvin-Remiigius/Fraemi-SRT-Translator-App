import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />
);

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
    <Spinner size={28} className="text-brand" />
    <p className="text-sm">{label}</p>
    <span className="sr-only" role="status">{label}</span>
  </div>
);

export default Spinner;
