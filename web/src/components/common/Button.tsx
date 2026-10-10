import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-teal hover:shadow-md focus:ring-[#0d9488]/50 active:bg-[#115e59]',
    secondary: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] focus:ring-slate-400/50',
    outline: 'border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1E293B] focus:ring-slate-300',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-red-500/50 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-[#64748B] hover:text-[#1E293B] focus:ring-slate-200',
    success: 'bg-[#10B981] hover:bg-[#059669] text-white focus:ring-emerald-500/50 shadow-sm',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
