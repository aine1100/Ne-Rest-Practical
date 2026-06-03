export interface Inspection {
  id: number;
  extinguisherId: number;
  inspectorId: number | null;
  inspectionDate: string | null;
  inspectionTime: string | null;
  status: string;
  remarks?: string | null;
  findings?: string | null;
  statusBefore?: string | null;
  statusAfter?: string | null;
  createdBy?: number | null;
  createdAt?: string;
}
