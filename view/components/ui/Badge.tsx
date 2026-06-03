import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Expired: 'bg-red-100 text-red-700',
  'Inspection Due': 'bg-amber-100 text-amber-700',
  'Under Maintenance': 'bg-blue-100 text-blue-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Requested: 'bg-purple-100 text-purple-700',
  Accepted: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Damaged: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  Overdue: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  unread: 'bg-[#FF383C]/10 text-[#FF383C]',
  read: 'bg-gray-100 text-gray-600',
};

export default function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[status] || 'bg-gray-100 text-gray-700'
      )}
    >
      {status}
    </span>
  );
}
