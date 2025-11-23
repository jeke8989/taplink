import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-500/10 border-green-500/40',
      icon: <CheckCircle2 className="text-green-400" size={20} />,
      text: 'text-green-200',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/40',
      icon: <AlertCircle className="text-red-400" size={20} />,
      text: 'text-red-200',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/40',
      icon: <AlertTriangle className="text-yellow-400" size={20} />,
      text: 'text-yellow-200',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/40',
      icon: <Info className="text-blue-400" size={20} />,
      text: 'text-blue-200',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top-5">
      <div
        className={`${styles.bg} border rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md backdrop-blur-sm`}
      >
        {styles.icon}
        <p className={`${styles.text} flex-1 text-sm font-medium`}>{message}</p>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

