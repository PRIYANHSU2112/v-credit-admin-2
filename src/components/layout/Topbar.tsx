import { useState } from 'react'
import {
  Menu,
  Check,
  Shield,
  LogOut,
  User,
  QrCode,
  Maximize2,
  X,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { switchRoleDemo, logout } from '@/features/auth/slices/authSlice'
import { APP_CONFIG } from '@/config/app.config'
import type { UserRole } from '@/types/user'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'

interface TopbarProps {
  onOpenMobileMenu: () => void
}

const PAGE_LABELS: Record<string, string> = {
  '/app/overview': 'HOMES',
  '/app/analytics': 'ANALYTICS',
  '/app/distributors': 'USER LIST',
  '/app/dealers': 'USER LIST',
  '/app/users': 'USER LIST',
  '/app/pending-users': 'USER LIST',
  '/app/user-search': 'USER LIST',
  '/app/add-distributor': 'HOMES',
  '/app/reports/distributor-low-key': 'REPORTS',
  '/app/reports/dealer-low-key': 'REPORTS',
  '/app/reports/transfer': 'REPORTS',
  '/app/reports/received-key': 'REPORTS',
  '/app/reports/iphone-transfer': 'REPORTS',
  '/app/reports/iphone-received': 'REPORTS',
  '/app/settings': 'SETTINGS',
  '/app/settings/key-price': 'SYSTEM SETTING',
  '/app/settings/iphone-key-price': 'SYSTEM SETTING',
  '/app/download-agreement': 'HOMES',
  '/app/audit': 'AUDIT',
  '/app/keys': 'KEYS',
  '/app/customers': 'CUSTOMERS',
  '/app/loans': 'LOANS',
  '/app/devices': 'DEVICES',
  '/app/finance': 'FINANCE',
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentSubLabel = PAGE_LABELS[location.pathname] || 'HOMES'

  const handleRoleSwitch = (newRole: UserRole) => {
    dispatch(switchRoleDemo(newRole))
    setIsRoleDropdownOpen(false)
    toast.success(`Persona switched to ${newRole.replace('_', ' ').toUpperCase()}`, {
      description: 'Permissions and navigation updated dynamically.',
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    toast.info('Signed out successfully.')
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
      {/* Left: Mobile Menu + Page Title (Figma style: "Dashboard\nHOMES") */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 lg:hidden text-gray-600 hover:bg-gray-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title - matches Figma header */}
        <div className="hidden sm:block">
          <p className="text-lg font-bold text-gray-900 leading-tight">Dashboard</p>
          <p className="text-xs font-semibold text-[#007bff] uppercase tracking-wider leading-tight">{currentSubLabel}</p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2.5">
        {/* Role Switcher Pill (Demo) */}
        {APP_CONFIG.isMockEnabled && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-cyan-600" />
              <span className="capitalize">{user?.role?.replace('_', ' ') || 'Role'}</span>
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50"
                onMouseLeave={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Switch Demo Persona
                </div>
                {APP_CONFIG.roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSwitch(role.value as UserRole)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-gray-800 hover:bg-cyan-50 transition-colors"
                  >
                    <span>{role.label}</span>
                    {user?.role === role.value && (
                      <Check className="h-3.5 w-3.5 text-cyan-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen toggle - matches Figma icon */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* QR Code icon - matches Figma */}
        <button
          type="button"
          onClick={() => toast.info('QR code scanner launched.')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
          title="QR Code Scanner"
        >
          <QrCode className="h-4 w-4" />
        </button>

        {/* User Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 hover:bg-gray-200 transition-colors overflow-hidden"
            title="User menu"
          >
            <User className="h-5 w-5 text-gray-600" />
          </button>

          {isUserDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl z-50"
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {user?.email || 'admin@vcredit.in'}
                </p>
                <span className="inline-block mt-1 text-[10px] capitalize bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">
                  {user?.role?.replace('_', ' ') || 'Super Admin'}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserDropdownOpen(false)
                    toast.info('Profile view ready')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile</span>
                </button>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
