import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    addToast,
    removeToast,
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: CheckCircle,
          iconColor: 'text-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: XCircle,
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          icon: AlertCircle,
          iconColor: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: AlertCircle,
          iconColor: 'text-blue-400'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          const Icon = styles.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`glass rounded-2xl p-4 min-w-80 max-w-md ${styles.bg} border ${styles.border} flex items-start gap-3`}
            >
              <Icon size={20} className={styles.iconColor} />
              <p className="text-white flex-1 text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};