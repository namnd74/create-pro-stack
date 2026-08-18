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
  return useSWR<ApiResponse<User>>('/auth/me', (url: string) => apiClient.get(url), {
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
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (typeof window !== 'undefined' && response.data?.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
      }
      // Revalidate user profile in SWR cache
      mutate('/auth/me');
      options?.onSuccess?.(response as any);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, error };
}
