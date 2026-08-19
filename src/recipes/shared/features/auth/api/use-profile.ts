import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * Query hook to fetch current authenticated user profile
 */
export function useProfile() {
  return useQuery<ApiResponse<User>>({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      return apiClient.get<never, ApiResponse<User>>('/auth/me');
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
