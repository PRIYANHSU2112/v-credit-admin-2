import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { APP_CONFIG } from '@/config/app.config'
import { storage } from '@/lib/storage'
import type { AuthState, LoginResponse } from '../types'
import type { UserProfile, UserRole } from '@/types/user'

// Load persisted user & token from storage if available
const savedToken = storage.get<string | null>(APP_CONFIG.storageKeys.token, null)
const savedUser = storage.get<UserProfile | null>(APP_CONFIG.storageKeys.user, null)

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  role: savedUser?.role ?? null,
  isAuthenticated: Boolean(savedToken && savedUser),
  isLoading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<LoginResponse>
    ) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.role = user.role
      state.isAuthenticated = true
      state.error = null

      // Persist to storage
      storage.set(APP_CONFIG.storageKeys.token, token)
      storage.set(APP_CONFIG.storageKeys.user, user)
    },
    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        if (action.payload.role) {
          state.role = action.payload.role
        }
        storage.set(APP_CONFIG.storageKeys.user, state.user)
      }
    },
    switchRoleDemo: (state, action: PayloadAction<UserRole>) => {
      // For instant prototype role switching
      if (state.user) {
        state.user.role = action.payload
        state.role = action.payload
        storage.set(APP_CONFIG.storageKeys.user, state.user)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.role = null
      state.isAuthenticated = false
      state.error = null

      storage.remove(APP_CONFIG.storageKeys.token)
      storage.remove(APP_CONFIG.storageKeys.user)
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCredentials,
  updateUser,
  switchRoleDemo,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions

export default authSlice.reducer
