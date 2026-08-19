import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState('');

  // Clear the field each time the dialog opens.
  useEffect(() => {
    if (isOpen) setProjectName('');
  }, [isOpen]);

  const trimmed = projectName.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    onCreate(trimmed);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a new project"
      description="Give it a name you'll recognise later — usually the title and the language you're dubbing into."
    >
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="new-project-name"
          className="mb-2 block text-sm font-medium text-neutral-200"
        >
          Project name
        </label>
        <input
          type="text"
          id="new-project-name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Interstellar — Tamil dub"
          className="w-full rounded-lg border border-line bg-surface-2 p-3 text-white
                     placeholder-dim transition-colors focus:border-brand/50 focus:outline-none"
          autoFocus
        />

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="glow-brand rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-black transition-all
                       hover:bg-brand-soft disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-dim disabled:shadow-none"
          >
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
