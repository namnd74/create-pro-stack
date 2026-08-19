import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LoginFormData } from '../schemas/auth.schema';
import type { AuthResponse } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * Mutation hook for user login
 */
export function useLogin() {
  return useMutation<ApiResponse<AuthResponse>, Error, LoginFormData>({
    mutationFn: async (credentials: LoginFormData) => {
      return apiClient.post<never, ApiResponse<AuthResponse>>('/auth/login', credentials);
    },
    onSuccess: (response) => {
      if (typeof window !== 'undefined' && response.data?.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
      }
    },
  });
}
