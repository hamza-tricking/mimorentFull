'use client';

import { useToast } from '../contexts/ToastContext';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render on client side after component is mounted
  if (!isMounted) return null;

  // Render as portal to body to ensure highest stacking context
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
