import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSaveChanges = async () => {
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error updating profile');
      }
    } catch (error) {
      alert('Error updating profile');
    }
  };

  return (
    <div className="pt-24">
      <main className="container mx-auto p-6 lg:p-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Settings</h1>
        <div className="bg-gray-800 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Username</label>
              <input
                type="text"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button onClick={handleSaveChanges} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
