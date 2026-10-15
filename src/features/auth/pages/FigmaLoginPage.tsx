import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { EmiSafeLogo } from '@/components/common/EmiSafeLogo'
import { useAppDispatch } from '@/app/store/hooks'
import { setCredentials } from '../slices/authSlice'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import type { UserRole } from '@/types/user'
import { toast } from 'sonner'

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
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-emerald-waves relative overflow-hidden select-none">
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
