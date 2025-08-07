import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const SignUp = () => {
  // 1. STATE MANAGEMENT: We create variables to hold our form data and messages.
  const [formData, setFormData] = useState({
    username: '', // Note: Your backend expects 'username', not 'name'.
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigating to other pages

  // 2. ONCHANGE HANDLER: This function updates our state as the user types.
  const handleChange = (e) => {
    // e.target.id will be 'username', 'email', or 'password'
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 3. ONSUBMIT HANDLER: This runs when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault(); // This is CRITICAL - it stops the page from reloading.
    setLoading(true);
    setMessage('');

    try {
      // This is the API call to your Flask backend.
      const res = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // If successful, show a success message and navigate to the sign-in page.
        setMessage('Account created successfully! Please sign in.');
        setTimeout(() => navigate('/signin'), 2000); // Redirect after 2 seconds
      } else {
        // If your backend sends an error, display it.
        setMessage(data.error || 'Registration failed.');
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
          Create Your Account
        </h2>

        {/* We connect our handleSubmit function to the form here */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            {/* We connect the input to our state here */}
            <input
              type="text"
              id="username" // Changed from 'name' to 'username' to match backend
              placeholder="Enter your full name"
              onChange={handleChange}
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
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="w-full bg-yellow-400 text-black text-base font-semibold py-3 px-4 rounded-full hover:bg-yellow-300 transition-colors disabled:bg-neutral-600"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Display success or error messages here */}
        {message && <p className="text-center text-white mt-5">{message}</p>}

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