import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/api/auth-api';
import authReducer from '@/features/auth/store/auth-slice';
import uiReducer from './slices/ui-slice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
