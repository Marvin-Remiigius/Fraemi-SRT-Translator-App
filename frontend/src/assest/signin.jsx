import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- IMPORT THE CONTEXT

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- GET THE LOGIN FUNCTION FROM CONTEXT
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        login(data); // <-- SAVE THE USER DATA TO OUR GLOBAL STATE
        navigate('/dashboard');
      } else {
        setMessage(data.error || 'Sign in failed.');
      }
    } catch (error) {
      setLoading(false);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    // ... your existing JSX for the sign-in form ...
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tighter">
          Welcome Back
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ... form inputs ... */}
        </form>
      </div>
    </div>
  );
};

export default SignIn;