import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-page-gradient p-4">
      <Outlet />
    </div>
  );
}
