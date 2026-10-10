import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div
        className={twMerge(
          clsx(
            'relative w-full bg-white rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all duration-200 animate-scale-up',
            maxWidthStyles[maxWidth]
          )
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
            <div>
              {title && <h3 className="text-base sm:text-lg font-bold text-[#1E293B]">{title}</h3>}
              {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
