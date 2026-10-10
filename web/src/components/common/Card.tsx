import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'outline' | 'gradient';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#E2E8F0] shadow-card',
    flat: 'bg-slate-50 border border-slate-200/60',
    outline: 'bg-transparent border border-[#E2E8F0]',
    gradient: 'gradient-card-blue border border-blue-100',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-5 sm:p-6 transition-all duration-200',
          variantStyles[variant],
          hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
