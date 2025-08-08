import React, { useState } from 'react';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreate(projectName.trim());
      setProjectName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Create a New Project</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-project-name" className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
          <input
            type="text"
            id="new-project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Movie Title - Language Dub"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            autoFocus
          />
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-5 rounded-lg transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;