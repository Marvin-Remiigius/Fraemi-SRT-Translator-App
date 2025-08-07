import React from 'react';
import { Link } from 'react-router-dom'; 

const SignIn = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tighter">
          Welcome Back
        </h2>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors mt-4"
          >
            Sign In
          </button>
        </form>

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