import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Check, X } from 'lucide-react';
import AuthLayout, {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from '../components/AuthLayout';
import Spinner from '../components/Spinner';

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'lowercase', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'uppercase', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'A number', test: (p) => /\d/.test(p) },
  {
    key: 'special',
    label: 'A special character',
    test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

const STRENGTH = [
  { label: 'Very weak', bar: 'bg-red-500', text: 'text-red-400' },
  { label: 'Weak', bar: 'bg-red-500', text: 'text-red-400' },
  { label: 'Fair', bar: 'bg-orange-400', text: 'text-orange-400' },
  { label: 'Good', bar: 'bg-brand', text: 'text-brand' },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-400' },
];

const SignUp = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: no trimming here — trimming on every keystroke made it impossible to
  // type a space in your name. We trim once, on submit.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const passed = useMemo(
    () => RULES.filter((r) => r.test(formData.password)).length,
    [formData.password]
  );
  const allRulesPassed = passed === RULES.length;
  const strength = STRENGTH[Math.max(0, passed - 1)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) {
      setError('Your password does not meet all of the requirements below.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Account created. Taking you to sign in…');
        setTimeout(() => navigate('/signin'), 1500);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start translating subtitle files in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-semibold text-brand transition-colors hover:text-brand-soft"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className={authLabelClass}>
            Full name
          </label>
          <input
            type="text"
            id="username"
            autoComplete="name"
            placeholder="Enter your full name"
            onChange={handleChange}
            value={formData.username}
            required
            className={authInputClass}
          />
        </div>

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
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
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

          {formData.password && (
            <div className="mt-3">
              <div className="flex gap-1" aria-hidden="true">
                {RULES.map((rule, i) => (
                  <div
                    key={rule.key}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < passed ? strength.bar : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1.5 text-xs font-semibold ${strength.text}`}>{strength.label}</p>

              <ul className="mt-3 grid gap-1.5">
                {RULES.map((rule) => {
                  const ok = rule.test(formData.password);
                  return (
                    <li
                      key={rule.key}
                      className={`flex items-center gap-2 text-xs ${
                        ok ? 'text-emerald-400' : 'text-dim'
                      }`}
                    >
                      {ok ? <Check size={13} /> : <X size={13} />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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

        {success && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3"
          >
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <p className="text-sm leading-snug text-emerald-200">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || Boolean(success)}
          className={`${authButtonClass} mt-2`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {loading && <Spinner size={15} />}
            {loading ? 'Creating account…' : 'Create account'}
          </span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
