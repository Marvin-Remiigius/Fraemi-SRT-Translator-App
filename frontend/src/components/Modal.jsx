import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, description, children }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Stop the page behind the overlay from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="surface-lit animate-scale-in relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/60 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-dim transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <h2 className="pr-8 text-xl font-bold text-white">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
