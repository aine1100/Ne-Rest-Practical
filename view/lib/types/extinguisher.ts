export interface ExtinguisherSummary {
  id: number;
  serialNumber: string;
  type: string;
  size?: string;
  building: string;
  floor: string;
  room: string;
  status: string;
  manufactureDate?: string;
  installationDate?: string;
  expiryDate: string;
  assignedUserId?: number | null;
}

export interface ExtinguisherDetail extends ExtinguisherSummary {
  size: string;
  manufactureDate: string;
  installationDate: string;
  assignedUserId: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}
