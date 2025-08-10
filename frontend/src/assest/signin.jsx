// FILE: frontend/src/pages/Signin.jsx
//
// This is the complete code for the Sign In page component.
// It handles user input, calls the backend login API, and redirects on success.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  // 1. STATE MANAGEMENT: Variables for form data, messages, and loading status.
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigating to other pages

  // 2. ONCHANGE HANDLER: Updates state as the user types.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 3. ONSUBMIT HANDLER: Runs when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from reloading
    setLoading(true);
    setMessage('');

    try {
      // This is the API call to your Flask backend's login endpoint.
      const res = await fetch('http://localhost:5001/auth/login', { // Note the port is 5001
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // If login is successful, redirect to the main dashboard.
        navigate('/'); // Redirect to the homepage/dashboard
      } else {
        // If your backend sends an error (e.g., "Invalid credentials"), display it.
        setMessage(data.error || 'Sign in failed.');
      }
    } catch (error) {
      setLoading(false);
      setMessage('An error occurred. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tighter">
          Welcome Back
        </h2>

        {/* We connect our handleSubmit function to the form here */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          {/* Password Input */}
          <div>
             <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors mt-4 disabled:bg-neutral-600"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Display success or error messages here */}
        {message && <p className="text-center text-red-500 mt-5">{message}</p>}

        {/* Link to Sign Up Page */}
        <p className="text-sm text-center text-neutral-400 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
