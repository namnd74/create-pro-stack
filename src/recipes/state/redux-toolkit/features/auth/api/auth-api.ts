import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginFormData } from '../schemas/auth.schema';
import type { AuthResponse, User } from '../types';

const nodeEnv = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env;

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: nodeEnv?.NEXT_PUBLIC_API_URL || viteEnv?.VITE_API_URL || '/api',
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
