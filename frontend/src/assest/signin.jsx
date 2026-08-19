import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import AuthLayout, {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from '../components/AuthLayout';
import Spinner from '../components/Spinner';

const SignIn = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        // Return the user to wherever ProtectedRoute bounced them from.
        navigate(location.state?.from || '/dashboard', { replace: true });
      } else {
        setError(data.error || 'Sign in failed.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to get to your projects."
      footer={
        <>
          Don’t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brand transition-colors hover:text-brand-soft"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            onChange={handleChange}
            value={formData.email}
            required
            className={authInputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-200">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand transition-colors hover:text-brand-soft"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
              required
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-dim transition-colors hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 p-3"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
            <p className="text-sm leading-snug text-red-200">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className={`${authButtonClass} mt-2`}>
          <span className="inline-flex items-center justify-center gap-2">
            {loading && <Spinner size={15} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
