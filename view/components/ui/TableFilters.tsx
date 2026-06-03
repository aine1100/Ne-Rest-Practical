'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export interface TableFilterValues {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export const emptyFilters: TableFilterValues = {
  search: '',
  status: '',
  dateFrom: '',
  dateTo: '',
};

export default function TableFilters({
  values,
  onChange,
  onApply,
  onReset,
  statusOptions = [],
  searchPlaceholder = 'Search…',
  dateLabel = 'Date',
}: {
  values: TableFilterValues;
  onChange: (values: TableFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  statusOptions?: string[];
  searchPlaceholder?: string;
  dateLabel?: string;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-5"
    >
      <Input
        label="Search"
        placeholder={searchPlaceholder}
        value={values.search}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
      />
      {statusOptions.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">Status</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
            value={values.status}
            onChange={(e) => onChange({ ...values, status: e.target.value })}
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <Input
        label={`${dateLabel} from`}
        type="date"
        value={values.dateFrom}
        onChange={(e) => onChange({ ...values, dateFrom: e.target.value })}
      />
      <Input
        label={`${dateLabel} to`}
        type="date"
        value={values.dateTo}
        onChange={(e) => onChange({ ...values, dateTo: e.target.value })}
      />
      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1">Apply</Button>
        <Button type="button" variant="secondary" onClick={onReset}>Reset</Button>
      </div>
    </form>
  );
}

export function buildFilterParams(filters: TableFilterValues, extra?: Record<string, unknown>) {
  const params: Record<string, unknown> = { limit: 50, ...extra };
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  return params;
}
