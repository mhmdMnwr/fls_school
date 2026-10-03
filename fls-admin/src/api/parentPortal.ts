import axios from 'axios';

const parentClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

parentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fls_parent_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

parentClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginUrl = error.config?.url?.includes('/parent/login');
      if (!isLoginUrl) {
        localStorage.removeItem('fls_parent_token');
        localStorage.removeItem('fls_parent_student');
        if (
          window.location.pathname.startsWith('/parent') &&
          window.location.pathname !== '/parent'
        ) {
          window.location.href = '/parent';
        }
      }
    }
    return Promise.reject(error);
  },
);

export interface ParentStudent {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ParentLoginResponse {
  accessToken: string;
  student: ParentStudent;
}

export interface TimetableSlot {
  weekday: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  teacherName: string;
  groupName: string;
}

export interface ParentGroup {
  id: string;
  name: string;
  subjectName: string;
  className: string;
  teacherName: string;
  studyTime: { weekday: string; startTime: string; endTime: string }[];
}

export interface ParentProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  groups: ParentGroup[];
}

export interface ParentAttendanceItem {
  id: string;
  isPresent: boolean;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isFreeTrial: boolean;
  subjectName: string;
  groupName: string;
}

export interface ParentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  absenceRate: number;
}

export interface ParentAttendanceResponse {
  data: ParentAttendanceItem[];
  summary: ParentAttendanceSummary;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ParentPaymentItem {
  id: string;
  paidOn: string;
  amount: number;
  description: string;
}

export interface ParentPaymentsResponse {
  totalPaid: number;
  count: number;
  payments: ParentPaymentItem[];
}

export const parentPortalApi = {
  login: async (
    username: string,
    password: string,
  ): Promise<ParentLoginResponse> => {
    const res = await parentClient.post<ParentLoginResponse>('/parent/login', {
      username,
      password,
    });
    return res.data;
  },

  getProfile: async (): Promise<ParentProfile> => {
    const res = await parentClient.get<ParentProfile>('/parent/profile');
    return res.data;
  },

  getTimetable: async (): Promise<Record<string, TimetableSlot[]>> => {
    const res = await parentClient.get<Record<string, TimetableSlot[]>>(
      '/parent/timetable',
    );
    return res.data;
  },

  getAttendance: async (
    page = 1,
    limit = 10,
  ): Promise<ParentAttendanceResponse> => {
    const res = await parentClient.get<ParentAttendanceResponse>(
      '/parent/attendance',
      { params: { page, limit } },
    );
    return res.data;
  },

  getPayments: async (): Promise<ParentPaymentsResponse> => {
    const res = await parentClient.get<ParentPaymentsResponse>(
      '/parent/payments',
    );
    return res.data;
  },
};
