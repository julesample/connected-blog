
import React, { useEffect } from 'react';
import { ToastType } from '../types';
import Icon from './Icon';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastStyles = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    border: 'border-green-500 dark:border-green-400',
    text: 'text-green-800 dark:text-green-200',
    icon: <Icon name="save" className="h-6 w-6 text-green-500" />
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900',
    border: 'border-red-500 dark:border-red-400',
    text: 'text-red-800 dark:text-red-200',
    icon: <Icon name="trash" className="h-6 w-6 text-red-500" />
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-blue-500 dark:border-blue-400',
    text: 'text-blue-800 dark:text-blue-200',
    icon: <Icon name="sparkles" className="h-6 w-6 text-blue-500" />
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    border: 'border-orange-500 dark:border-orange-400',
    text: 'text-orange-800 dark:text-orange-200',
    icon: <Icon name="info" className="h-6 w-6 text-orange-500" />
  }
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const styles = toastStyles[type];

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center max-w-xs w-full p-4 rounded-lg shadow-lg border-l-4 ${styles.bg} ${styles.border} ${styles.text}`} role="alert">
      <div className="flex-shrink-0">
        {styles.icon}
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-transparent rounded-lg focus:ring-2 focus:ring-slate-400 p-1.5 inline-flex h-8 w-8" onClick={onClose} aria-label="Close">
        <span className="sr-only">Close</span>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
      </button>
    </div>
  );
};

export default Toast;