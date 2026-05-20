import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const lastToastTimeRef = useRef(0);
  const lastToastMessageRef = useRef('');
  const timeoutRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((props, typeArg) => {
    let config = {};
    if (typeof props === 'string') {
      config = { message: props, type: typeArg || 'info' };
    } else if (props) {
      config = props;
    }
    const { type = 'info', title, message, actionText, onAction } = config;

    const now = Date.now();
    // Cooldown of 2 seconds for duplicate messages, and 800ms general cooldown between different messages
    if (message === lastToastMessageRef.current && now - lastToastTimeRef.current < 2000) {
      return null;
    }
    if (now - lastToastTimeRef.current < 800) {
      return null;
    }

    lastToastTimeRef.current = now;
    lastToastMessageRef.current = message;

    const id = Math.random().toString(36).substr(2, 9);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToasts([{ id, type, title, message, actionText, onAction }]);

    timeoutRef.current = setTimeout(() => {
      removeToast(id);
    }, 3000);

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastContainer key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal container component for the Toast UI
import Toast from '../components/ui/Toast';

const ToastContainer = (props) => {
  return (
    <div className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300">
      <Toast {...props} />
    </div>
  );
};
