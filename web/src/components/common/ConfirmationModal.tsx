import React from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  const icons = {
    danger: <XCircle className="w-12 h-12 text-[#EF4444]" />,
    warning: <AlertTriangle className="w-12 h-12 text-[#F59E0B]" />,
    info: <Info className="w-12 h-12 text-[#006EFF]" />,
    success: <CheckCircle2 className="w-12 h-12 text-[#10B981]" />,
  };

  const bgIcons = {
    danger: 'bg-red-50 text-[#EF4444]',
    warning: 'bg-amber-50 text-[#F59E0B]',
    info: 'bg-blue-50 text-[#006EFF]',
    success: 'bg-emerald-50 text-[#10B981]',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const,
    success: 'success' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="flex flex-col items-center text-center p-2">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${bgIcons[variant]}`}>
          {icons[variant]}
        </div>

        <h3 className="text-lg font-bold text-[#1E293B] mb-2">{title}</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
