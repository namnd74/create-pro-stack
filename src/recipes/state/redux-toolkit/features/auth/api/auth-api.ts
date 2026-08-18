import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginFormData } from '../schemas/auth.schema';
import type { AuthResponse, User } from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : undefined) || '/api',
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
