import { api } from './api';

export interface RxEntry {
  sph?: string;
  cyl?: string;
  axis?: string;
  add?: string;
}

export interface OpticalOrderPayload {
  appointmentId?: string | null;
  encounterId: string;
  patientId: string;
  rx: { od: RxEntry; os: RxEntry };
  lensType?: string;
  lensMaterial?: string;
  coatings?: string[];
  frameType?: string;
  frameRef?: string;
  collectionMethod?: string;
  orderRef?: string;
  pdMm?: string;
  notes?: string;
}

export interface OpticalOrder extends OpticalOrderPayload {
  id: string;
  prescribedByDoctorId: string;
  status: 'READY_TO_DELIVER' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  deliveredByUserId?: string | null;
  patient?: {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    grandfatherName?: string | null;
    phone?: string;
    gender?: string | null;
    dob?: string | null;
  };
}

export async function sendOrderToReception(payload: OpticalOrderPayload): Promise<OpticalOrder> {
  return api.post<OpticalOrder>('/optical-orders', payload);
}

export async function getOrderForEncounter(encounterId: string): Promise<OpticalOrder | null> {
  return api.get<OpticalOrder | null>(`/optical-orders/encounter/${encounterId}`);
}

export async function listOpticalOrders(status?: 'READY_TO_DELIVER' | 'DELIVERED'): Promise<OpticalOrder[]> {
  const q = status ? `?status=${status}` : '';
  return api.get<OpticalOrder[]>(`/optical-orders${q}`);
}

export async function deliverOpticalOrder(id: string): Promise<OpticalOrder> {
  return api.patch<OpticalOrder>(`/optical-orders/${id}/deliver`);
}
