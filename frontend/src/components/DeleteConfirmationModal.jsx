import React, { useState, useEffect } from 'react';

const DeleteConfirmationModal = ({ project, onClose, onConfirm }) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset input when the modal opens for a new project
  useEffect(() => {
    if (project) {
      setConfirmationInput('');
    }
  }, [project]);

  if (!project) return null;

  const isConfirmed = confirmationInput === project.name;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm(project.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-red-500 mb-4">Confirm Deletion</h2>
        <p className="text-gray-300 mb-6">
          This action is irreversible. To confirm, please type the full project name: <strong className="text-yellow-400">{project.name}</strong>
        </p>
        
        <label htmlFor="delete-confirm-input" className="sr-only">Project Name</label>
        <input
          type="text"
          id="delete-confirm-input"
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />

        <div className="mt-8 flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:bg-red-900 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;