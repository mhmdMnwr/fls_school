import { api } from '@/lib/api';
import { StudentAbsenceSummary, Paginated } from '@/types/api';

export interface AttendanceItem {
  id: string;
  isPresent: boolean;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  subjectName?: string;
  session?: {
    id?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    isFreeTrial?: boolean;
    group?: {
      subject?: { name?: string };
      teacher?: { firstName?: string; lastName?: string };
    };
  };
}

export const absencesApi = {
  getStudentSummary: async (studentId: string) => {
    const res = await api.get<StudentAbsenceSummary>(`/absences/students/${studentId}/summary`);
    return res.data;
  },
  getStudentAbsences: async (studentId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get<Paginated<AttendanceItem>>(`/absences/students/${studentId}`, {
      params,
    });
    return res.data;
  },
  saveSessionAttendance: async (
    sessionId: string,
    records: { studentId: string; isPresent: boolean }[]
  ) => {
    const res = await api.put<{ success: boolean; modifiedCount: number }>(
      `/absences/sessions/${sessionId}`,
      { records }
    );
    return res.data;
  },
};
