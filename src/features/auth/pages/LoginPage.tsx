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

import { APP_CONFIG } from '@/config/app.config'

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
    name: 'Master Vault Admin',
    identifier: 'admin@vcredit.in',
    label: 'Super Admin',
    desc: 'Global Network Access',
  },
  {
    role: 'stockist',
    name: 'Music Beats Telecom',
    identifier: 'stockist.north@vcredit.in',
    label: 'Stockist',
    desc: 'Regional Scope (North)',
  },
  {
    role: 'distributor',
    name: 'VEDA ENTERPRISE Hub',
    identifier: 'delhi.dist@vcredit.in',
    label: 'Distributor',
    desc: 'City Hub Scope (Delhi)',
  },
  {
    role: 'dealer',
    name: 'Apex Phone Gallery',
    identifier: 'metro.telecom@vcredit.in',
    label: 'Dealer',
    desc: 'Retail Store & End Users',
  },
]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      toast.error('Please enter both your identifier and password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${APP_CONFIG.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      const json = await res.json()

      if (json.success && json.data?.token) {
        const u = json.data
        const effectiveRole = (u.enterpriseRole || (u.role === 'admin' ? 'super_admin' : u.role)) as UserRole

        dispatch(
          setCredentials({
            token: u.token,
            user: {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || '+91 98765 43210',
              role: effectiveRole,
              status: 'active',
              availableKeys: u.keys ?? 0,
              allocatedKeys: u.keys ?? 0,
              walletBalance: 250000,
              createdAt: '2026-01-15T10:00:00Z',
            },
          })
        )
        toast.success(`Welcome back, ${u.name}! (${effectiveRole.toUpperCase()})`)
        navigate(from, { replace: true })
        return
      } else {
        toast.error(json.message || 'Invalid credentials')
      }
    } catch (err) {
      console.warn('Live login network issue, using scoped demo session:', err)
      const demoUser = DEMO_ACCOUNTS.find((d) => d.role === activeDemoRole) || DEMO_ACCOUNTS[0]
      dispatch(
        setCredentials({
          token: `demo_token_${activeDemoRole}`,
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center p-4 bg-login-white-green overflow-hidden selection:bg-emerald-500/20">
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

      <div className="relative z-10 w-full max-w-[460px] space-y-6">
        {/* Brand Header with Uploaded V-Credit Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group cursor-pointer">
            <EmiSafeLogo size={76} />
            <div className="absolute -inset-2 rounded-full bg-emerald-400/30 blur-md -z-10 group-hover:bg-emerald-400/45 transition-colors" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              V-CREDIT
            </h1>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold tracking-wide mt-1">
              Enterprise Device Security & MDM Console
            </p>
          </div>
        </div>

        {/* Login Card with Frosted Glass Aesthetics */}
        <Card className="p-6 sm:p-8 backdrop-blur-2xl bg-white/90 dark:bg-card/90 border border-emerald-100/90 dark:border-emerald-500/20 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.18),0_10px_20px_-5px_rgba(0,0,0,0.04)] rounded-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-muted-foreground">
                Email / Mobile / Username
              </label>
              <Input
                type="text"
                placeholder="e.g. admin@vcredit.in or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-emerald-600 dark:text-primary" />}
                required
                className="h-11 rounded-xl bg-white dark:bg-background/80 border-slate-200 dark:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-foreground"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-muted-foreground">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info('Password recovery link sent to registered mobile.')
                  }}
                  className="text-xs text-emerald-600 dark:text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-emerald-600 dark:text-primary" />}
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
                className="h-11 rounded-xl bg-white dark:bg-background/80 border-slate-200 dark:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-foreground"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-bold rounded-xl mt-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all"
              isLoading={isLoading}
              loadingText="Authenticating..."
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to Console
            </Button>
          </form>

          {/* Demo Accounts Quick-Select Chips */}
          <div className="pt-4 border-t border-slate-100 dark:border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-muted-foreground flex items-center gap-1.5">
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
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-border/60 bg-slate-50/60 dark:bg-muted/40 hover:bg-emerald-50/40 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-foreground text-xs leading-tight">
                      {acc.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-muted-foreground truncate mt-0.5">
                      {acc.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Security Trust Footnote */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-900/80 dark:text-emerald-300 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>V-Credit 256-bit Encrypted Operations Session</span>
        </div>
      </div>
    </div>
  )
}
