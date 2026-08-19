import { LoginForm } from '@/features/auth/components/login-form';

export default function AuthPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </main>
  );
}
