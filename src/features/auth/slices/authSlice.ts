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

const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr_super_1',
    name: 'Master Vault Admin',
    email: 'admin@vcredit.in',
    phone: '9800000001',
    role: 'super_admin',
    parentName: null,
    parentId: null,
    status: 'active',
    createdAt: '2026-01-01',
    availableKeys: 13022,
  },
  stockist: {
    id: 'usr_stk_1',
    name: 'Music Beats',
    email: 'stockist.musicbeats@vcredit.in',
    phone: '9407262622',
    role: 'stockist',
    parentName: 'Master Vault Admin',
    parentId: 'usr_super_1',
    status: 'active',
    createdAt: '2026-01-10',
    availableKeys: 6500,
  },
  distributor: {
    id: 'usr_dst_1',
    name: 'VEDA ENTERPRISE',
    email: 'distributor.veda@vcredit.in',
    phone: '7000142357',
    role: 'distributor',
    parentName: 'Music Beats',
    parentId: 'usr_stk_1',
    status: 'active',
    createdAt: '2026-01-15',
    availableKeys: 2400,
  },
  dealer: {
    id: 'usr_dlr_1',
    name: 'Apex Phone Gallery',
    email: 'dealer.apex@vcredit.in',
    phone: '9811029384',
    role: 'dealer',
    parentName: 'VEDA ENTERPRISE',
    parentId: 'usr_dst_1',
    status: 'active',
    createdAt: '2026-02-01',
    availableKeys: 320,
  },
  sub_admin: {
    id: 'usr_sub_1',
    name: 'Operations Sub-Admin',
    email: 'subadmin@vcredit.in',
    phone: '9800000002',
    role: 'sub_admin',
    parentName: 'Master Vault Admin',
    parentId: 'usr_super_1',
    status: 'active',
    createdAt: '2026-01-05',
    availableKeys: 1000,
  },
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
      // For instant prototype role switching with full profile & hierarchy bindings
      const profile = ROLE_PROFILES[action.payload] || {
        id: `usr_${action.payload}`,
        name: action.payload.replace('_', ' ').toUpperCase(),
        email: `${action.payload}@vcredit.in`,
        phone: '9800000000',
        role: action.payload,
        status: 'active',
        createdAt: '2026-01-01',
      }
      state.user = profile
      state.role = action.payload
      state.token = 'demo_token_' + action.payload
      state.isAuthenticated = true
      storage.set(APP_CONFIG.storageKeys.user, profile)
      storage.set(APP_CONFIG.storageKeys.token, state.token)
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
