import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { useLogin } from '../api/use-auth-swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const { login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        alert('Signed in successfully with SWR!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm w-full mx-auto p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-1 text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Sign In (SWR)</h2>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/30">
          {error.message || 'Authentication failed. Please try again.'}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="name@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
