export type Id = string;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Level {
  id: Id;
  name: string;
  position: number;
  classesCount?: number;
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolClass {
  id: Id;
  name: string;
  level: Level | Id;
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: Id;
  name: string;
  schoolClass: SchoolClass | Id;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: Id;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherGroupSummary {
  id: Id;
  name: string;
  isActive: boolean;
  subject: { id: Id; name: string } | null;
  class: { id: Id; name: string } | null;
}

export interface TeacherDetail extends Teacher {
  groups: TeacherGroupSummary[];
}

export interface StudyTimeSlot {
  weekday: string;
  startTime: string;
  endTime: string;
}

export interface StudyGroup {
  id: Id;
  name: string;
  subject: Subject;
  teacher: Teacher;
  isActive: boolean;
  studyTime?: StudyTimeSlot[];
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrolledStudentInGroup {
  enrollmentId: Id;
  id: Id;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface StudyGroupDetail extends StudyGroup {
  students: EnrolledStudentInGroup[];
}

export interface Student {
  id: Id;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE';
  origin?: 'ADMIN' | 'WEBSITE';
  phone?: string;
  email?: string;
  schoolClass?: SchoolClass | null;
  groupsCount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentEnrollment {
  id: Id;
  enrolledOn: string;
  isActive: boolean;
  group: StudyGroup;
}

export interface StudentDetail extends Student {
  enrollments: StudentEnrollment[];
  totalPaid: number;
}

export interface Enrollment {
  id: Id;
  student: Student | Id;
  group: StudyGroup | Id;
  enrolledOn: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Session {
  id: Id;
  group: StudyGroup;
  date: string;
  startTime: string;
  endTime: string;
  isFreeTrial: boolean;
  createdAt?: string;
}

export interface UpcomingSession {
  id: Id;
  date: string;
  startTime: string;
  endTime: string;
  isFreeTrial: boolean;
  subjectName: string;
  className: string;
  teacherName: string;
  timeRange: string;
}

export interface AttendanceRecord {
  id: Id;
  student: {
    id: Id;
    firstName: string;
    lastName: string;
  } | null;
  isPresent: boolean;
}

export interface SessionDetail extends Session {
  attendance: AttendanceRecord[];
}

export interface StudentAbsenceSummary {
  totalSessions: number;
  present: number;
  absent: number;
  absenceRate: number;
}

export interface StudentPaymentSummary {
  totalPaid: number;
  paymentsCount?: number;
  count?: number;
  lastPaymentDate: string | null;
}

export interface Payment {
  id: Id;
  student: Student | Id;
  paidOn: string;
  amount: number;
  description: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: Id;
  type: string;
  title: string;
  detail: string;
  createdAt: string;
}

export interface DashboardStats {
  students: { total: number; newThisMonth: number };
  levels: { total: number };
  subjects: { total: number };
  teachers: { total: number };
  preRegistrations?: number;
}

export interface EnrollmentEvolution {
  month: number;
  total: number;
}

export interface StudentsByLevel {
  levelId: Id;
  level: string;
  count: number;
  percentage: number;
}

export interface RecentStudent {
  id: Id;
  fullName: string;
  className: string | null;
  levelName: string | null;
  createdAt: string;
  isActive: boolean;
  origin?: 'ADMIN' | 'WEBSITE';
}

export interface Testimonial {
  id: Id;
  student?: {
    id: Id;
    firstName: string;
    lastName: string;
    schoolClass?: {
      id: Id;
      name: string;
    } | null;
  } | null;
  authorName: string;
  rating: number;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  createdAt: string;
}

export interface TestimonialCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface SiteSettings {
  key?: string;
  heroTagline?: string;
  heroDescription?: string;
  tagline?: string;
  aboutTitle?: string;
  aboutText1?: string;
  aboutText2?: string;
  address?: string;
  googleMapsEmbedUrl?: string;
  mapsEmbedUrl?: string;
  mapsUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  scheduleWeekdays?: string;
  scheduleSaturday?: string;
  scheduleSunday?: string;
  openingHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  socialLinks?: { name: string; url: string }[];
}

// Helper to safely get relation object or fallback
export function asObj<T extends { id?: string }>(val: T | Id | undefined | null): T | null {
  if (val && typeof val === 'object' && 'id' in val) {
    return val as T;
  }
  return null;
}
