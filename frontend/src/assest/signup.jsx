import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// Password strength calculation function
const calculatePasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (checks.length) strength++;
  if (checks.lowercase) strength++;
  if (checks.uppercase) strength++;
  if (checks.number) strength++;
  if (checks.special) strength++;

  return {
    level: strength,
    checks,
  };
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, checks: {} });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value.trim() });

    if (id === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password strength
    if (passwordStrength.level < 5) {
      setMessage('Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessage('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Signup error:', error);
      setMessage('An error occurred. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        
        <Link 
          to="/" 
          className="absolute top-6 left-6 text-neutral-400 hover:text-white transition-colors"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tighter">
          Create Your Account
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your full name"
              onChange={handleChange}
              value={formData.username}
              required
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.password}
                required
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        passwordStrength.level >= level
                          ? passwordStrength.level <= 2
                            ? 'bg-red-500'
                            : passwordStrength.level <= 4
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {passwordStrength.level <= 2
                    ? 'Weak'
                    : passwordStrength.level <= 4
                    ? 'Medium'
                    : 'Strong'}
                </p>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors mt-4 disabled:bg-neutral-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-white mt-6">
            {message}
          </p>
        )}

        <p className="text-sm text-center text-neutral-400 mt-8">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;