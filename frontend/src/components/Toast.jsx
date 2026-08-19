import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/25',
  },
  error: {
    Icon: AlertCircle,
    accent: 'text-red-400',
    ring: 'ring-red-500/25',
  },
  info: {
    Icon: Info,
    accent: 'text-brand',
    ring: 'ring-yellow-500/25',
  },
};

const Toast = ({ message, show, type = 'success' }) => {
  const nodeRef = useRef(null);
  const { Icon, accent, ring } = VARIANTS[type] || VARIANTS.info;

  return (
    <CSSTransition in={show} nodeRef={nodeRef} timeout={300} classNames="toast" unmountOnExit>
      <div
        ref={nodeRef}
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 left-6 sm:left-auto z-[60] flex items-start gap-3
                    max-w-sm sm:max-w-md rounded-xl bg-surface-2/95 backdrop-blur
                    px-4 py-3.5 shadow-2xl ring-1 ${ring} border border-line`}
      >
        <Icon size={18} className={`${accent} mt-0.5 shrink-0`} aria-hidden="true" />
        <p className="text-sm leading-snug text-white">{message}</p>
      </div>
    </CSSTransition>
  );
};

export default Toast;
