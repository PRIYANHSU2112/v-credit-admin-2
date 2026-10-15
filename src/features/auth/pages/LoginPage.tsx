import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Lock, User } from 'lucide-react'
import { useAppDispatch } from '@/app/store/hooks'
import { setCredentials } from '../slices/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'
import type { UserRole } from '@/types/user'
import { EmiSafeLogo } from '@/components/common/EmiSafeLogo'

interface DemoAccount {
  role: UserRole
  name: string
  identifier: string
  label: string
  desc: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'super_admin',
    name: 'Rajesh Sharma',
    identifier: 'admin@vcredit.in',
    label: 'Super Admin',
    desc: 'Central Oversight',
  },
  {
    role: 'stockist',
    name: 'Aman Verma',
    identifier: 'stockist.north@vcredit.in',
    label: 'Stockist',
    desc: 'Regional Inventory',
  },
  {
    role: 'distributor',
    name: 'Vikram Mehta',
    identifier: 'delhi.dist@vcredit.in',
    label: 'Distributor',
    desc: 'City Operations Hub',
  },
  {
    role: 'dealer',
    name: 'Karan Patel',
    identifier: 'metro.telecom@vcredit.in',
    label: 'Dealer',
    desc: 'Retail Shop & KYC',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [identifier, setIdentifier] = useState('admin@vcredit.in')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeDemoRole, setActiveDemoRole] = useState<UserRole>('super_admin')

  const from = location.state?.from?.pathname || '/app/overview'

  const handleSelectDemo = (acc: DemoAccount) => {
    setIdentifier(acc.identifier)
    setPassword('password123')
    setActiveDemoRole(acc.role)
    toast.info(`Selected ${acc.label} credentials`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      toast.error('Please enter both your identifier and password.')
      return
    }

    setIsLoading(true)

    // Simulating authentication delay
    setTimeout(() => {
      setIsLoading(false)

      const demoUser = DEMO_ACCOUNTS.find((d) => d.role === activeDemoRole) || DEMO_ACCOUNTS[0]

      dispatch(
        setCredentials({
          token: `demo_jwt_token_${Date.now()}`,
          user: {
            id: `usr_${activeDemoRole}`,
            name: demoUser.name,
            email: identifier.includes('@') ? identifier : `${identifier}@vcredit.in`,
            phone: '+91 98765 43210',
            role: activeDemoRole,
            status: 'active',
            availableKeys: activeDemoRole === 'dealer' ? 14 : 1500,
            allocatedKeys: activeDemoRole === 'dealer' ? 86 : 14200,
            walletBalance: 250000,
            createdAt: '2026-01-15T10:00:00Z',
          },
        })
      )

      toast.success(`Welcome back, ${demoUser.name}!`)
      navigate(from, { replace: true })
    }, 600)
  }

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center p-4 bg-emerald-waves overflow-hidden selection:bg-emerald-500/20 select-none">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="relative z-10 w-full max-w-[460px] space-y-6">
        {/* Brand Header with Uploaded V-Credit Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group cursor-pointer">
            <EmiSafeLogo size={76} />
            <div className="absolute -inset-2 rounded-full bg-emerald-400/20 blur-md -z-10 group-hover:bg-emerald-400/35 transition-colors" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white drop-shadow-sm">
              V-CREDIT
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 font-medium tracking-wide mt-1">
              Enterprise Device Security & MDM Console
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 backdrop-blur-2xl bg-card/90 dark:bg-card/85 border border-white/20 dark:border-emerald-500/20 shadow-2xl rounded-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email / Mobile / Username
              </label>
              <Input
                type="text"
                placeholder="e.g. admin@vcredit.in or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-primary" />}
                required
                className="h-11 rounded-xl bg-background/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info('Password recovery link sent to registered mobile.')
                  }}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-primary" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-foreground text-muted-foreground transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                required
                className="h-11 rounded-xl bg-background/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-bold rounded-xl mt-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all"
              isLoading={isLoading}
              loadingText="Authenticating..."
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to Console
            </Button>
          </form>

          {/* Demo Accounts Quick-Select Chips */}
          <div className="pt-4 border-t border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Quick Demo Personas
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Click to fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = activeDemoRole === acc.role
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all duration-150 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30'
                        : 'border-border/60 bg-muted/40 hover:bg-muted/80'
                    }`}
                  >
                    <span className="font-bold text-foreground text-xs leading-tight">
                      {acc.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {acc.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Security Trust Footnote */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/90 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>V-Credit 256-bit Encrypted Operations Session</span>
        </div>
      </div>
    </div>
  )
}
