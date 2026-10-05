import { api } from '@/lib/api';
import { Testimonial, TestimonialCounts, Paginated } from '@/types/api';

export const testimonialsApi = {
  getTestimonials: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<Paginated<Testimonial>>('/testimonials', {
      params,
    });
    return res.data;
  },
  getCounts: async () => {
    const res = await api.get<TestimonialCounts>('/testimonials/counts');
    return res.data;
  },
  updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await api.patch<Testimonial>(`/testimonials/${id}/status`, {
      status,
    });
    return res.data;
  },
  deleteTestimonial: async (id: string) => {
    const res = await api.delete<{ deleted: boolean }>(`/testimonials/${id}`);
    return res.data;
  },
  getDashboardTestimonials: async (limit: number = 3) => {
    const res = await api.get<Testimonial[]>('/dashboard/testimonials', {
      params: { limit },
    });
    return res.data;
  },
};
