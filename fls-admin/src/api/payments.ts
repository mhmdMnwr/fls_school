import { api } from '@/lib/api';
import { Payment, StudentPaymentSummary, Paginated } from '@/types/api';

export interface GetPaymentsParams {
  studentId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreatePaymentInput {
  studentId: string;
  paidOn: string;
  amount: number;
  description?: string;
}

export const paymentsApi = {
  getAll: async (params?: GetPaymentsParams) => {
    const res = await api.get<Paginated<Payment>>('/payments', { params });
    return res.data;
  },
  getStudentSummary: async (studentId: string) => {
    const res = await api.get<StudentPaymentSummary>(`/payments/students/${studentId}/summary`);
    return res.data;
  },
  getByStudent: async (studentId: string) => {
    const res = await api.get<Paginated<Payment>>('/payments', {
      params: { studentId, limit: 100 },
    });
    return res.data.data;
  },
  create: async (data: CreatePaymentInput) => {
    const res = await api.post<Payment>('/payments', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreatePaymentInput>) => {
    const res = await api.patch<Payment>(`/payments/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/payments/${id}`);
    return res.data;
  },
};
