import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ProtectedRoute } from './protected-route';
import { DashboardHome } from '@/features/dashboard/components/dashboard-home';
import { LoginForm } from '@/features/auth/components/login-form';
import { StarterHome } from '@/features/home/components/starter-home';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginForm />,
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
    element: <StarterHome authHref="/login" secondaryHref="/dashboard" secondaryLabel="Open dashboard" />,
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
