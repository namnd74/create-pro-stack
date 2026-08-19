'use client';

import { useActionState } from 'react';
import { loginAction, type ActionState } from '../actions/auth.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-sm w-full mx-auto p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-1 text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Sign In (Server Action)</h2>
        <p className="text-sm text-muted-foreground">Executed on Server (0 KB Client Fetch)</p>
      </div>

      {state?.message && (
        <div
          role={state.success ? 'status' : 'alert'}
          className={`p-3 text-sm rounded-md border ${
            state.success
              ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
              : 'bg-destructive/15 text-destructive border-destructive/30'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          autoComplete="email"
          aria-invalid={Boolean(state?.errors?.email)}
          aria-describedby={state?.errors?.email ? 'email-error' : undefined}
          required
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-xs text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={Boolean(state?.errors?.password)}
          aria-describedby={state?.errors?.password ? 'password-error' : undefined}
          required
        />
        {state?.errors?.password && (
          <p id="password-error" className="text-xs text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Processing on Server...' : 'Sign In'}
      </Button>
    </form>
  );
}
