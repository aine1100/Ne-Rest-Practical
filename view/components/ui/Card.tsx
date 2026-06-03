import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function Card({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-5 shadow-sm', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
