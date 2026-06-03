'use client';

import { ReactNode } from 'react';

export default function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {children}
        </tbody>
      </table>
      {(!children || (Array.isArray(children) && children.length === 0)) && empty && (
        <p className="p-8 text-center text-sm text-gray-500">{empty}</p>
      )}
    </div>
  );
}
