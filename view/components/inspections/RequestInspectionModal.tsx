'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { apiPost } from '@/lib/api';
import { isTodayOrFuture, todayIsoDate } from '@/lib/dates';

export default function RequestInspectionModal({
  open,
  extinguisherId,
  extinguisherLabel,
  onClose,
  onSuccess,
}: {
  open: boolean;
  extinguisherId: number | null;
  extinguisherLabel?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({ inspectionDate: '', inspectionTime: '10:00', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!extinguisherId) return;

    if (form.inspectionDate && !isTodayOrFuture(form.inspectionDate)) {
      toast.error('Preferred date must be today or a future date');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/inspections/request', {
        extinguisherId,
        inspectionDate: form.inspectionDate || undefined,
        inspectionTime: form.inspectionTime || undefined,
        remarks: form.remarks || undefined,
      });
      toast.success('Inspection request submitted');
      setForm({ inspectionDate: '', inspectionTime: '10:00', remarks: '' });
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to request inspection'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Request Inspection" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {extinguisherLabel && (
          <p className="text-sm text-gray-600">
            Extinguisher: <span className="font-medium text-gray-900">{extinguisherLabel}</span>
          </p>
        )}
        <Input
          label="Preferred Date (optional)"
          type="date"
          min={todayIsoDate()}
          value={form.inspectionDate}
          onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
        />
        <Input
          label="Preferred Time (optional)"
          value={form.inspectionTime}
          onChange={(e) => setForm({ ...form, inspectionTime: e.target.value })}
          placeholder="HH:MM"
        />
        <Input
          label="Notes"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          placeholder="Reason for inspection request"
        />
        <Button type="submit" loading={submitting} className="w-full">
          Submit Request
        </Button>
      </form>
    </Modal>
  );
}
