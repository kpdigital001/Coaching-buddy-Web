import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  icon,
  rightElement,
  required,
  type = 'text',
  className,
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
          {label}
          {required && <span className="text-[#EF4444] text-sm">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#006EFF]/20 focus:border-[#006EFF] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]',
              icon && 'pl-10',
              (isPasswordType || rightElement) && 'pr-10',
              error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
              className
            )
          )}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-[#94A3B8] hover:text-[#1E293B] transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {!isPasswordType && rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#EF4444] font-medium flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#64748B]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default InputField;
