import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="ambient relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-15"
      style={{ backgroundImage: "url('/bg.avif')" }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" aria-hidden="true" />

    <div className="animate-fade-up w-full max-w-md">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={15} /> Back to home
      </Link>

      <div className="surface-lit rounded-2xl border border-line bg-surface/90 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
        <Link to="/" className="mb-7 flex items-center justify-center gap-2.5">
          <img className="h-8 w-8 object-contain" src="/Logo.png" alt="" />
          <span className="text-[0.95rem] font-bold tracking-tight text-white">
            FRAEMI<span className="text-brand"> VISION</span>
          </span>
        </Link>

        <h1 className="text-center text-2xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>}

        <div className="mt-7">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </div>
  </div>
);

export const authInputClass =
  'w-full rounded-lg border border-line bg-surface-2 p-3 text-white placeholder-dim ' +
  'transition-colors focus:border-brand/50 focus:outline-none';

export const authLabelClass = 'mb-2 block text-sm font-medium text-neutral-200';

export const authButtonClass =
  'glow-brand w-full rounded-full bg-brand px-4 py-3 text-sm font-bold text-black transition-all ' +
  'hover:bg-brand-soft disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-dim disabled:shadow-none';

export default AuthLayout;
