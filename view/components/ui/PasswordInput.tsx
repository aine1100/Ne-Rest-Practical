'use client';

import { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function PasswordInput({ label, error, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#FF383C] focus:ring-1 focus:ring-[#FF383C]',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-gray-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
