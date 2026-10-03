import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import RouteErrorBoundary from '@/components/common/RouteErrorBoundary';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import StudentsPage from '@/features/students/StudentsPage';
import StudentDetailPage from '@/features/students/StudentDetailPage';
import LevelsPage from '@/features/levels/LevelsPage';
import SubjectsPage from '@/features/subjects/SubjectsPage';
import TeachersPage from '@/features/teachers/TeachersPage';
import TeacherDetailPage from '@/features/teachers/TeacherDetailPage';
import GroupsPage from '@/features/groups/GroupsPage';
import GroupDetailPage from '@/features/groups/GroupDetailPage';
import SessionsPage from '@/features/sessions/SessionsPage';
import SessionDetailPage from '@/features/sessions/SessionDetailPage';
import PaymentsPage from '@/features/payments/PaymentsPage';
import SettingsPage from '@/features/settings/SettingsPage';
import NotFoundPage from '@/features/NotFoundPage';
import ParentLoginPage from '@/features/parent/ParentLoginPage';
import ParentLayout from '@/features/parent/ParentLayout';
import ParentDashboardPage from '@/features/parent/ParentDashboardPage';
import RequireParentAuth from '@/features/parent/RequireParentAuth';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/parent',
    element: <ParentLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/parent/login',
    element: <Navigate to="/parent" replace />,
  },
  {
    path: '/parent/tableau-de-bord',
    element: (
      <RequireParentAuth>
        <ParentLayout />
      </RequireParentAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <ParentDashboardPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'eleves', element: <StudentsPage /> },
          { path: 'eleves/:id', element: <StudentDetailPage /> },
          { path: 'niveaux', element: <LevelsPage /> },
          { path: 'matieres', element: <SubjectsPage /> },
          { path: 'profs', element: <TeachersPage /> },
          { path: 'profs/:id', element: <TeacherDetailPage /> },
          { path: 'groupes', element: <GroupsPage /> },
          { path: 'groupes/:id', element: <GroupDetailPage /> },
          { path: 'seances', element: <SessionsPage /> },
          { path: 'seances/:id', element: <SessionDetailPage /> },
          { path: 'paiements', element: <PaymentsPage /> },
          { path: 'parametres', element: <SettingsPage /> },
          ...(import.meta.env.DEV
            ? [
                {
                  path: 'ui-kit',
                  async lazy() {
                    const UiKitPage = (await import('@/features/UiKitPage')).default;
                    return { element: <UiKitPage /> };
                  },
                },
              ]
            : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
