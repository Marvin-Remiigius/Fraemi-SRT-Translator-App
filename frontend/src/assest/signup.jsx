import React from 'react';

const SignUp = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tighter">
          Create Your Account
        </h2>

        {/* Form */}
        <form className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors mt-4"
          >
            Sign Up
          </button>
        </form>

        {/* Link to Sign In Page */}
        <p className="text-sm text-center text-neutral-400 mt-8">
          Already have an account?{' '}
          <a href="/signin" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;