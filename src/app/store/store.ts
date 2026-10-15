import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '../api/baseApi'
import authReducer from '@/features/auth/slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore any non-serializable actions if necessary
        ignoredActions: ['auth/setCredentials'],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
