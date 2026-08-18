import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ProtectedRoute } from './protected-route';
import { DashboardHome } from '@/features/dashboard/components/dashboard-home';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Login Page</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardHome />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">404 - Not Found</h1>
      </div>
    ),
  },
]);
