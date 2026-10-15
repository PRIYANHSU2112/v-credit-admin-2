import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { EmiSafeLogo } from '@/components/common/EmiSafeLogo'
import { useAppDispatch } from '@/app/store/hooks'
import { setCredentials } from '../slices/authSlice'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import type { UserRole } from '@/types/user'
import { toast } from 'sonner'

// Floating ambient green bubbles configuration
const FLOATING_BUBBLES = [
  { id: 1, size: 28, left: '5%', duration: '15s', delay: '0s' },
  { id: 2, size: 52, left: '15%', duration: '20s', delay: '2s', sway: true },
  { id: 3, size: 22, left: '24%', duration: '13s', delay: '5s' },
  { id: 4, size: 68, left: '33%', duration: '24s', delay: '1s', sway: true },
  { id: 5, size: 36, left: '42%', duration: '17s', delay: '7s' },
  { id: 6, size: 84, left: '52%', duration: '26s', delay: '3s', sway: true },
  { id: 7, size: 26, left: '62%', duration: '14s', delay: '8s' },
  { id: 8, size: 58, left: '71%', duration: '21s', delay: '4s', sway: true },
  { id: 9, size: 32, left: '80%', duration: '16s', delay: '6s' },
  { id: 10, size: 74, left: '89%', duration: '25s', delay: '0.5s', sway: true },
  { id: 11, size: 24, left: '10%', duration: '12s', delay: '9s' },
  { id: 12, size: 44, left: '46%', duration: '18s', delay: '11s', sway: true },
  { id: 13, size: 20, left: '76%', duration: '11s', delay: '10s' },
  { id: 14, size: 62, left: '95%', duration: '22s', delay: '8s', sway: true },
]

export default function FigmaLoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [phone, setPhone] = useState('9407262622')
  const [password, setPassword] = useState('12345678')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('stockist')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) {
      toast.error('Please enter your phone and password!')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      const roleNames: Record<UserRole, string> = {
        super_admin: 'Super Admin Central',
        sub_admin: 'Sub Admin Operations',
        stockist: 'Super Stockiest Head',
        distributor: 'VEDA ENTERPRISE',
        dealer: 'SHREE GURUSHAHEB MOBILE',
      }

      dispatch(
        setCredentials({
          token: `jwt_token_${Date.now()}`,
          user: {
            id: `usr_${selectedRole}`,
            name: roleNames[selectedRole] || 'Stockist Admin',
            email: `${phone}@emisafe.com`,
            phone: phone,
            role: selectedRole,
            status: 'active',
            availableKeys: selectedRole === 'dealer' ? 2 : 40,
            allocatedKeys: selectedRole === 'dealer' ? 140 : 13022,
            createdAt: '2026-01-01T00:00:00Z',
          },
        })
      )

      toast.success(`Welcome to ${selectedRole.replace('_', ' ').toUpperCase()} Console!`)
      navigate(ROUTE_PATHS.DASHBOARD, { replace: true })
    }, 450)
  }

  const roleTitles: Record<UserRole, string> = {
    super_admin: 'Super Admin Login',
    sub_admin: 'Sub Admin Login',
    stockist: 'Super Stockiest Login',
    distributor: 'Distributor Login',
    dealer: 'Dealer Portal Login',
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-login-white-green relative overflow-hidden select-none">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-emerald-400/25 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[420px] h-[420px] bg-teal-300/25 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-lime-300/20 dark:bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Translucent Green Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {FLOATING_BUBBLES.map((bubble) => (
          <div
            key={bubble.id}
            className={`floating-bubble ${bubble.sway ? 'floating-bubble-sway' : ''}`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              animationDuration: bubble.duration,
              animationDelay: bubble.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[460px] pt-12">
        {/* Floating Top Emblem matching Figma Screenshot 230543 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <EmiSafeLogo size={84} />
        </div>

        {/* White Card matching exact Figma Screenshot */}
        <div className="bg-white rounded-[38px] shadow-2xl p-8 sm:p-10 text-center relative z-10">
          <h2 className="text-2xl sm:text-[28px] font-bold text-gray-800 tracking-tight mt-6">
            {roleTitles[selectedRole]}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-8">
            Please enter your phone and password!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Mobile Number Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 block pl-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Mobile Number"
                className="w-full h-12 rounded-xl bg-[#eef3f8] px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 block pl-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full h-12 rounded-xl bg-[#eef3f8] px-4 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset Password Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() =>
                  toast.info('OTP reset code sent to registered mobile: 9407262622')
                }
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset Password
              </button>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-[#007bff] hover:bg-[#0069d9] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center cursor-pointer mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Persona Switcher Tray */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Select Demo Role Persona
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'super_admin', label: 'Super Admin' },
                { role: 'stockist', label: 'Stockist' },
                { role: 'distributor', label: 'Distributor' },
                { role: 'dealer', label: 'Dealer' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(item.role as UserRole)
                    if (item.role === 'super_admin') setPhone('9811000001')
                    if (item.role === 'stockist') setPhone('9407262622')
                    if (item.role === 'distributor') setPhone('7000142357')
                    if (item.role === 'dealer') setPhone('9479597706')
                  }}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                    selectedRole === item.role
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-300/80 mt-4">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span>EMI Safe 256-bit Encrypted Portal</span>
        </div>
      </div>
    </div>
  )
}
