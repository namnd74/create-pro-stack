import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { LoginFormData } from '../schemas/auth.schema';
import type { User, AuthResponse } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * SWR Hook to fetch current user profile
 */
export function useProfile() {
  return useSWR<ApiResponse<User>>('/auth/me', (url: string) => apiClient.get<never, ApiResponse<User>>(url), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}

/**
 * Mutation function for user login using SWR
 */
export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (
    credentials: LoginFormData,
    options?: { onSuccess?: (data: ApiResponse<AuthResponse>) => void }
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await apiClient.post<never, ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (typeof window !== 'undefined' && response.data?.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
      }
      // Revalidate user profile in SWR cache
      mutate('/auth/me');
      options?.onSuccess?.(response);
      return response;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Authentication failed');
      setError(error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, error };
}
