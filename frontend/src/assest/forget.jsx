import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        
        <h2 className="text-3xl font-bold text-center text-white mb-4 tracking-tighter">
          Forgot Password
        </h2>
        <p className="text-center text-neutral-400 mb-8 text-sm">
          Enter your email to receive a password reset link.
        </p>

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
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors mt-4"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-8">
          <Link to="/signin" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;