import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LoginFormData } from '../schemas/auth.schema';
import { AuthResponse } from '../types';
import { ApiResponse } from '@/types/api';

/**
 * Mutation hook for user login
 */
export function useLogin() {
  return useMutation<ApiResponse<AuthResponse>, Error, LoginFormData>({
    mutationFn: async (credentials: LoginFormData) => {
      return apiClient.post('/auth/login', credentials);
    },
    onSuccess: (response) => {
      if (typeof window !== 'undefined' && response.data?.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
      }
    },
  });
}
