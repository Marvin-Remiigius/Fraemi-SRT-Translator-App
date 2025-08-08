import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

const Toast = ({ message, show }) => {
  const nodeRef = useRef(null); 

  return (
    <CSSTransition
      in={show}
      nodeRef={nodeRef} 
      timeout={300}
      classNames="toast"
      unmountOnExit
    >
      <div ref={nodeRef} className="fixed bottom-8 right-8 bg-green-500 text-white py-3 px-6 rounded-lg shadow-xl">
        {message}
      </div>
    </CSSTransition>
  );
};

export default Toast;