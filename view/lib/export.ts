import { apiDownload } from '@/lib/api';
import type { TableFilterValues } from '@/components/ui/TableFilters';
import { buildFilterParams } from '@/components/ui/TableFilters';

export function filtersToQuery(filters: TableFilterValues, extra?: Record<string, unknown>) {
  const params = buildFilterParams(filters, extra);
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function exportFilteredCsv(
  path: string,
  filters: TableFilterValues,
  filename: string,
  extra?: Record<string, unknown>
) {
  await apiDownload(`${path}${filtersToQuery(filters, extra)}`, filename);
}
