import { Outlet, Link } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="font-bold text-lg">⚡ React Vite Pro</div>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/login" className="hover:text-primary">Logout</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
