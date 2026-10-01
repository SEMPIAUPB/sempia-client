import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';

const AuthLayout = React.lazy(() => import('../features/auth/AuthLayout'));
const DashboardLayout = React.lazy(() => import('../layouts/DashboardLayout'));
const DashboardView = React.lazy(() => import('../features/dashboard/DashboardView'));
const GraphVisualization = React.lazy(() => import('../features/skills/GraphVisualization'));
const CodeEditorView = React.lazy(() => import('../features/submissions/CodeEditorView'));
const ProblemsCatalogView = React.lazy(() => import('../features/exercises/ProblemsCatalogView'));
const LoginView = React.lazy(() => import('../features/auth/LoginView'));
const RegisterView = React.lazy(() => import('../features/auth/RegisterView'));

const ProfileView = React.lazy(() => import('../features/profile/ProfileView'));
const SubmissionsHistoryView = React.lazy(() => import('../features/submissions/SubmissionsHistoryView'));
const RankingView = React.lazy(() => import('../features/gamification/RankingView'));
const CompetitionsView = React.lazy(() => import('../features/gamification/CompetitionsView'));
const AchievementsView = React.lazy(() => import('../features/gamification/AchievementsView'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: 'register', element: <RegisterView /> },
    ]
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: '', element: <DashboardView /> },
      { path: 'skills', element: <GraphVisualization /> },
      { path: 'problems', element: <ProblemsCatalogView /> },
      { path: 'exercise/:id', element: <CodeEditorView /> },
      { path: 'profile', element: <ProfileView /> },
      { path: 'submissions', element: <SubmissionsHistoryView /> },
      { path: 'ranking', element: <RankingView /> },
      { path: 'competitions', element: <CompetitionsView /> },
      { path: 'achievements', element: <AchievementsView /> },
    ]
  },
  {
    path: '*',
    element: <div>404 - Not Found</div>
  }
]);

export function AppRouter() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando aplicación...</div>}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}
