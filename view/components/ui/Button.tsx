'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export default function Button({
  className,
  variant = 'primary',
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#FF383C] text-white hover:bg-[#e63236]',
    secondary: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50',
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
