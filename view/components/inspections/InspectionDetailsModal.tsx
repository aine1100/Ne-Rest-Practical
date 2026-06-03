'use client';

import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { apiGet } from '@/lib/api';
import type { Inspection } from '@/lib/types/inspection';
import type { ExtinguisherDetail } from '@/lib/types/extinguisher';
import ExtinguisherDetailsModal from '@/components/extinguishers/ExtinguisherDetailsModal';

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function StatusCompare({ before, after }: { before?: string | null; after?: string | null }) {
  if (!before && !after) {
    return <p className="text-sm text-gray-500">Status snapshot not recorded for this inspection.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase text-amber-700">Before inspection</p>
        <div className="mt-2"><Badge status={before || 'Unknown'} /></div>
      </div>
      <div className="rounded-lg border border-green-100 bg-green-50 p-4">
        <p className="text-xs font-semibold uppercase text-green-700">After inspection</p>
        <div className="mt-2"><Badge status={after || 'Unknown'} /></div>
      </div>
    </div>
  );
}

export default function InspectionDetailsModal({
  inspectionId,
  open,
  onClose,
}: {
  inspectionId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [extinguisher, setExtinguisher] = useState<ExtinguisherDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewExt, setViewExt] = useState(false);

  useEffect(() => {
    if (!open || !inspectionId) {
      setInspection(null);
      setExtinguisher(null);
      return;
    }

    setLoading(true);
    apiGet<Inspection>(`/inspections/${inspectionId}`)
      .then((res) => {
        setInspection(res.data);
        return apiGet<ExtinguisherDetail>(`/extinguishers/${res.data.extinguisherId}`);
      })
      .then((res) => setExtinguisher(res.data))
      .catch(() => {
        toast.error('Failed to load inspection details');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, inspectionId, onClose]);

  return (
    <>
      <Modal open={open} title={`Inspection #${inspectionId ?? ''}`} onClose={onClose}>
        {loading ? (
          <Loader />
        ) : inspection ? (
          <div className="space-y-5">
            <dl>
              <DetailRow label="Extinguisher" value={`#${inspection.extinguisherId}${extinguisher ? ` — ${extinguisher.serialNumber}` : ''}`} />
              <DetailRow label="Inspection Date" value={inspection.inspectionDate || '—'} />
              <DetailRow label="Time" value={inspection.inspectionTime || '—'} />
              <DetailRow label="Status" value={<Badge status={inspection.status} />} />
              <DetailRow label="Remarks" value={inspection.remarks || '—'} />
              <DetailRow label="Findings" value={inspection.findings || '—'} />
            </dl>

            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">Extinguisher status change</p>
              <StatusCompare before={inspection.statusBefore} after={inspection.statusAfter} />
            </div>

            {extinguisher && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Current extinguisher details</p>
                <dl className="mt-2">
                  <DetailRow label="Serial" value={extinguisher.serialNumber} />
                  <DetailRow label="Type / Size" value={`${extinguisher.type} — ${extinguisher.size}`} />
                  <DetailRow label="Location" value={`${extinguisher.building}, ${extinguisher.floor}, ${extinguisher.room}`} />
                  <DetailRow label="Current Status" value={<Badge status={extinguisher.status} />} />
                  <DetailRow label="Expiry" value={extinguisher.expiryDate} />
                </dl>
              </div>
            )}

            <Button type="button" variant="secondary" className="w-full" onClick={() => setViewExt(true)}>
              View full extinguisher profile
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No details available.</p>
        )}
      </Modal>

      <ExtinguisherDetailsModal
        extinguisherId={inspection?.extinguisherId ?? null}
        open={viewExt}
        onClose={() => setViewExt(false)}
        title="Extinguisher Profile"
      />
    </>
  );
}
