'use client';

import Button from '@/components/ui/Button';

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {total}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
