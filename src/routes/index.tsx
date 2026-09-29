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
