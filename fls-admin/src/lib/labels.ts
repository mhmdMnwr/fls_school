import {
  UserPlus,
  GraduationCap,
  BookOpen,
  Layers,
  Settings,
  Activity,
  LucideIcon,
} from 'lucide-react';

export interface ActivityStyle {
  title: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}

export const ACTIVITY_MAP: Record<string, ActivityStyle> = {
  STUDENT_CREATED: {
    title: 'Un nouvel élève a été inscrit',
    icon: UserPlus,
    bg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  TEACHER_CREATED: {
    title: 'Un professeur a été ajouté',
    icon: GraduationCap,
    bg: '#E0E7FF',
    iconColor: '#4F46E5',
  },
  SUBJECT_CREATED: {
    title: 'Une matière a été créée',
    icon: BookOpen,
    bg: '#F3E8FF',
    iconColor: '#7E22CE',
  },
  SUBJECT_UPDATED: {
    title: 'Une matière a été modifiée',
    icon: BookOpen,
    bg: '#F3E8FF',
    iconColor: '#7E22CE',
  },
  LEVEL_CREATED: {
    title: 'Un niveau a été créé',
    icon: Layers,
    bg: '#FEF3C7',
    iconColor: '#B45309',
  },
  SETTINGS_UPDATED: {
    title: 'Paramètres mis à jour',
    icon: Settings,
    bg: '#F1F5F9',
    iconColor: '#64748B',
  },
  STUDENT_PREREGISTERED: {
    title: 'Pré-inscription en ligne',
    icon: UserPlus,
    bg: '#FEF3C7',
    iconColor: '#D97706',
  },
  TESTIMONIAL_SUBMITTED: {
    title: 'Nouvel avis déposé',
    icon: Activity,
    bg: '#FEF3C7',
    iconColor: '#D97706',
  },
  TESTIMONIAL_APPROVED: {
    title: 'Avis approuvé',
    icon: Activity,
    bg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  TESTIMONIAL_REJECTED: {
    title: 'Avis refusé',
    icon: Activity,
    bg: '#FEE2E2',
    iconColor: '#DC2626',
  },
};

export function getActivityConfig(type: string, fallbackTitle: string): ActivityStyle {
  if (ACTIVITY_MAP[type]) {
    return ACTIVITY_MAP[type];
  }
  return {
    title: fallbackTitle,
    icon: Activity,
    bg: '#F1F5F9',
    iconColor: '#64748B',
  };
}
