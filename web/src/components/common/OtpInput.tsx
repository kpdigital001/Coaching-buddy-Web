import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 4,
  error = false,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    // Focus first input on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [length, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const otpArray = value.split('');
    otpArray[index] = char;
    const newOtp = otpArray.join('').slice(0, length);
    onChange(newOtp);

    // Auto-advance to next input
    if (char && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextFocusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
      {Array.from({ length }).map((_, index) => {
        const digit = value[index] || '';
        const isFocused = value.length === index;

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={clsx(
              'w-13 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border transition-all duration-200 focus:outline-none select-none',
              error
                ? 'border-[#EF4444] bg-red-50/40 text-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/30'
                : digit
                ? 'border-[#006EFF] bg-blue-50/30 text-[#006EFF] ring-1 ring-[#006EFF]/40'
                : 'border-[#CBD5E1] bg-white text-[#1E293B] focus:border-[#006EFF] focus:ring-2 focus:ring-[#006EFF]/20',
              isFocused && !error && 'border-[#006EFF] ring-2 ring-[#006EFF]/30',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100'
            )}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
