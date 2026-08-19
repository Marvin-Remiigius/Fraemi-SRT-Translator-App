import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

const DeleteConfirmationModal = ({ project, onClose, onConfirm }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset when the dialog opens for a different project.
  useEffect(() => {
    if (project) {
      setConfirmationInput('');
      setIsDeleting(false);
    }
  }, [project]);

  if (!project) return null;

  const isConfirmed = confirmationInput.trim() === project.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    await onConfirm(project.id);
  };

  return (
    <Modal isOpen={Boolean(project)} onClose={onClose} title="Delete this project?">
      <div className="-mt-2 mb-5 flex gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-red-200">
          This permanently deletes the project along with every uploaded file and translation
          inside it. This cannot be undone.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="delete-confirm-input"
          className="mb-2 block text-sm text-neutral-200"
        >
          Type{' '}
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-brand">
            {project.name}
          </span>{' '}
          to confirm
        </label>
        <input
          type="text"
          id="delete-confirm-input"
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-line bg-surface-2 p-3 text-white
                     placeholder-dim transition-colors focus:border-red-500/60 focus:outline-none"
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
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5
                       text-sm font-bold text-white transition-colors hover:bg-red-500
                       disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-dim disabled:shadow-none"
          >
            {isDeleting && <Spinner size={15} />}
            {isDeleting ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteConfirmationModal;
