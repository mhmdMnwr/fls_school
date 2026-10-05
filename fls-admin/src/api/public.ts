import { api } from '@/lib/api';
import { SiteSettings } from '@/types/api';

export interface PublicSiteInfo {
  levelsCount: number;
  classesCount: number;
  subjectsCount: number;
  teachersCount: number;
}

export interface PublicSubject {
  id: string;
  name: string;
}

export interface PublicClass {
  id: string;
  name: string;
  subjectsCount: number;
  subjects: PublicSubject[];
}

export interface PublicLevel {
  id: string;
  name: string;
  position: number;
  classesCount: number;
  subjectsCount: number;
  classes: PublicClass[];
}

export interface PublicTeacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects: string[];
}

export interface PublicTestimonial {
  id: string;
  authorName: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface PublicTestimonialsResponse {
  data: PublicTestimonial[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PublicTestimonialSummary {
  count: number;
  average: number;
}

export interface CreatePublicRegistrationInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
}

export const publicApi = {
  getSiteInfo: async (): Promise<PublicSiteInfo> => {
    const res = await api.get<PublicSiteInfo>('/public/site-info');
    return res.data;
  },
  getSiteSettings: async (): Promise<SiteSettings> => {
    const res = await api.get<SiteSettings>('/public/site-settings');
    return res.data;
  },
  getLevels: async (): Promise<PublicLevel[]> => {
    const res = await api.get<PublicLevel[]>('/public/levels');
    return res.data;
  },
  getTeachers: async (): Promise<PublicTeacher[]> => {
    const res = await api.get<PublicTeacher[]>('/public/teachers');
    return res.data;
  },
  getTestimonials: async (page = 1, limit = 6): Promise<PublicTestimonialsResponse> => {
    const res = await api.get<PublicTestimonialsResponse>('/public/testimonials', {
      params: { page, limit },
    });
    return res.data;
  },
  getTestimonialsSummary: async (): Promise<PublicTestimonialSummary> => {
    const res = await api.get<PublicTestimonialSummary>('/public/testimonials/summary');
    return res.data;
  },
  register: async (data: CreatePublicRegistrationInput) => {
    const res = await api.post<{ success: boolean; message: string; studentId: string }>(
      '/public/registrations',
      data
    );
    return res.data;
  },
};
