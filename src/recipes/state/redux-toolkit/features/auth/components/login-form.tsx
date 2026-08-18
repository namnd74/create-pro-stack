import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { useLoginMutation } from '../api/auth-api';
import { useAppDispatch } from '@/stores/hooks';
import { setCredentials } from '@/stores/slices/auth-slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ user: response.user, accessToken: response.accessToken }));
      alert('Signed in successfully with Redux Toolkit!');
    } catch (err: any) {
      console.error('Login error', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm w-full mx-auto p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-1 text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Sign In (Redux Toolkit)</h2>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/30">
          {'data' in error ? (error.data as any)?.message || 'Authentication failed' : 'Authentication failed'}
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
