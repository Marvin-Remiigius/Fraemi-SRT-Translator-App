import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Info } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

// There is no password-reset endpoint on the backend yet. Rather than show a
// form that silently does nothing on submit, this page is explicit about it.
const ForgotPassword = () => (
  <AuthLayout
    title="Forgot your password?"
    subtitle="Self-service password reset isn’t available yet."
    footer={
      <>
        Remembered it?{' '}
        <Link
          to="/signin"
          className="font-semibold text-brand transition-colors hover:text-brand-soft"
        >
          Back to sign in
        </Link>
      </>
    }
  >
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-4">
      <Info size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-muted">
        We’re still building this. In the meantime, email us and we’ll reset your account
        manually.
      </p>
    </div>

    <a
      href="mailto:support@fraemivision.in?subject=Password%20reset%20request"
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand
                 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-brand-soft"
    >
      <Mail size={16} /> Email support
    </a>
  </AuthLayout>
);

export default ForgotPassword;
