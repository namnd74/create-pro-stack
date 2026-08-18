import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/api/auth-api';
import uiReducer from './slices/ui-slice';
import authReducer from './slices/auth-slice';

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
