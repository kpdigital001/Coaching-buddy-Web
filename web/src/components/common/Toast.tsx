import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#006EFF] shrink-0" />,
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white text-[#1E293B]',
    error: 'border-red-200 bg-white text-[#1E293B]',
    warning: 'border-amber-200 bg-white text-[#1E293B]',
    info: 'border-blue-200 bg-white text-[#1E293B]',
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 animate-slide-in-right',
              bgStyles[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#1E293B] leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#94A3B8] hover:text-[#1E293B] p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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

export default ToastProvider;
