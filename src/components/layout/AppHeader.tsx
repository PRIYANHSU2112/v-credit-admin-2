import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Maximize,
  Minimize,
  LogOut,
  Shield,
  Check,
  Menu,
  Sun,
  Moon,
  Sparkles,
  Monitor,
  Search,
  Bell,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  Copy,
  Users,
  Building2,
  X,
  Loader2,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { switchRoleDemo, logout } from '@/features/auth/slices/authSlice'
import { useTheme, THEME_ACCENT_OPTIONS } from '@/app/providers/ThemeProvider'
import {
  useLazyGlobalSearchQuery,
  useBulkGenerateKeysMutation,
  useGetNotificationsQuery,
} from '@/features/enterprise/api/enterpriseApi'
import type { UserRole } from '@/types/user'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ActiveSession {
  id: string
  os: string
  loginAt: string
  ip: string
  isCurrent: boolean
}

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess_1', os: 'Windows 11 (This Device)', loginAt: '15/10/2026 13:27:31', ip: '103.21.244.12', isCurrent: true },
  { id: 'sess_2', os: 'Windows 10 Workstation', loginAt: '15/10/2026 09:14:04', ip: '103.21.244.12', isCurrent: false },
  { id: 'sess_3', os: 'Windows (Edge Browser)', loginAt: '14/10/2026 21:18:47', ip: '115.99.120.45', isCurrent: false },
]

interface AppHeaderProps {
  title?: string
  subtitle?: string
  onOpenMobileSidebar: () => void
}

export function AppHeader({
  title = 'Dashboard',
  subtitle = 'HOMES',
  onOpenMobileSidebar,
}: AppHeaderProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const { isDark, toggleTheme, accent, setAccent } = useTheme()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS)

  // Super Admin Bulk Generate Modal State
  const [isBulkGenerateOpen, setIsBulkGenerateOpen] = useState(false)
  const [bulkCount, setBulkCount] = useState<number>(100)
  const [bulkNote, setBulkNote] = useState<string>('Batch Mint - Central Vault')
  const [bulkGenerateKeys, { isLoading: isBulkGenerating }] = useBulkGenerateKeysMutation()

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [triggerSearch, { data: searchResults, isFetching: isSearching }] = useLazyGlobalSearchQuery()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Notifications
  const { data: notificationsData } = useGetNotificationsQuery()
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false)
  const unreadCount = notificationsData?.data?.filter((n) => !n.read)?.length || 0

  // Impersonation state
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null)

  useEffect(() => {
    try {
      const imp = localStorage.getItem('vlocker_impersonate_user')
      if (imp) {
        setImpersonatedUser(JSON.parse(imp))
      }
    } catch {
      setImpersonatedUser(null)
    }
  }, [])

  // Debounced search trigger
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        triggerSearch(searchQuery.trim())
        setIsSearchOpen(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setIsSearchOpen(false)
    }
  }, [searchQuery, triggerSearch])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExitImpersonation = () => {
    localStorage.removeItem('vlocker_impersonate_token')
    localStorage.removeItem('vlocker_impersonate_user')
    setImpersonatedUser(null)
    toast.success('Exited impersonation mode. Restored Super Admin privileges.')
    window.location.reload()
  }

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkCount || bulkCount <= 0) {
      toast.error('Please enter a valid count greater than 0')
      return
    }

    try {
      const res = await bulkGenerateKeys({ count: bulkCount, description: bulkNote }).unwrap()
      toast.success(res.message || `Successfully generated ${bulkCount} license keys!`)
      setIsBulkGenerateOpen(false)
      setBulkCount(100)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mint keys in bulk')
    }
  }

  const handleTerminateSession = (id: string, os: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    toast.success(`Revoked remote login session for ${os}`)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false))
      }
    }
  }

  const handleRoleChange = (role: UserRole) => {
    dispatch(switchRoleDemo(role))
    setIsRoleDropdownOpen(false)
    toast.success(`Active Persona switched to ${role.replace('_', ' ').toUpperCase()}`, {
      description: 'Permissions and views adapted to this tier.',
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.info('Signed out of V-Credit Console')
  }

  return (
    <>
      {/* Impersonation Banner if active */}
      {impersonatedUser && (
        <div className="w-full bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1.5 flex items-center justify-between z-40 shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-slate-950" />
            <span>
              Impersonation Active: Viewing platform as <strong>{impersonatedUser.name || impersonatedUser.email}</strong> ({impersonatedUser.role?.toUpperCase() || 'PARTNER'})
            </span>
          </div>
          <button
            type="button"
            onClick={handleExitImpersonation}
            className="bg-slate-950 hover:bg-black text-amber-400 px-3 py-0.5 rounded text-[11px] font-bold tracking-wide transition-colors"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      <header className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-200 z-30 gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-display font-extrabold text-foreground tracking-tight leading-tight">
              {title}
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, stockists, dealers, IMEI..."
              className="w-full h-9 pl-10 pr-8 rounded-full border border-border/80 bg-muted/40 hover:bg-muted/70 focus:bg-background focus:border-primary text-xs font-medium text-foreground placeholder:text-muted-foreground transition-all outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Floating Panel */}
          {isSearchOpen && searchResults?.data && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-border bg-popover/95 backdrop-blur-md shadow-2xl z-50 p-3 max-h-96 overflow-y-auto space-y-3">
              {/* Keys Results */}
              {searchResults.data.keys && searchResults.data.keys.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span>Keys ({searchResults.data.keys.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.data.keys.slice(0, 4).map((k) => (
                      <div
                        key={k.id}
                        onClick={() => {
                          navigator.clipboard.writeText(k.label)
                          toast.success(`Copied key: ${k.label}`)
                        }}
                        className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-muted/80 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-mono font-bold text-foreground">{k.label}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            Type: {k.type}
                          </p>
                        </div>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users & Partners Results */}
              {searchResults.data.users && searchResults.data.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Users & Partners ({searchResults.data.users.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.data.users.slice(0, 4).map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setIsSearchOpen(false)
                          if (u.type === 'stockist') navigate('/app/stockists')
                          else if (u.type === 'distributor') navigate('/app/distributors')
                          else if (u.type === 'dealer') navigate('/app/dealers')
                          else navigate('/app/users')
                        }}
                        className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-muted/80 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-bold text-foreground">{u.label}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            Role: {u.type}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Results */}
              {searchResults.data.customers && searchResults.data.customers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5 text-sky-500" />
                    <span>Customers ({searchResults.data.customers.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.data.customers.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false)
                          navigate('/app/users')
                        }}
                        className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-muted/80 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-bold text-foreground">{c.label}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {c.type}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!searchResults.data.keys?.length && !searchResults.data.users?.length && !searchResults.data.customers?.length) && (
                <div className="p-4 text-center text-xs text-muted-foreground font-medium">
                  No matching records found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Bulk Generate Button (Super Admin) */}
          <button
            type="button"
            onClick={() => setIsBulkGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            title="Bulk Mint License Keys"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span className="hidden sm:inline">Bulk Generate</span>
          </button>

          {/* Super Admin Status Badge */}
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase border border-border bg-muted/60 text-muted-foreground">
            SUPER ADMIN
          </span>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-popover p-0 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                onMouseLeave={() => setIsNotifDropdownOpen(false)}
              >
                <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/30">
                  <div>
                    <span className="text-xs font-bold text-foreground">Alerts & Notifications</span>
                    <p className="text-[10px] text-muted-foreground">{unreadCount} unread system alerts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifDropdownOpen(false)
                      navigate('/app/notifications')
                    }}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notificationsData?.data?.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  ))}
                  {(!notificationsData?.data || notificationsData.data.length === 0) && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Persona Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen)
                setIsProfileOpen(false)
                setIsThemeMenuOpen(false)
              }}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-foreground hover:bg-primary/20 transition-all shadow-xs"
            >
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="capitalize hidden sm:inline">
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </span>
              <span className="text-[10px] text-primary">(Change)</span>
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Hierarchy Persona
                </div>
                {[
                  { role: 'super_admin', label: 'Super Admin', desc: 'Central Platform Owner' },
                  { role: 'stockist', label: 'Stockist', desc: 'Regional Territory Head' },
                  { role: 'distributor', label: 'Distributor', desc: 'City / Hub Operations' },
                  { role: 'dealer', label: 'Dealer', desc: 'Retail Shop & KYC Store' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleChange(item.role as UserRole)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors text-left',
                      user?.role === item.role
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    {user?.role === item.role && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Accent Theme Picker */}
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen)
                setIsRoleDropdownOpen(false)
                setIsProfileOpen(false)
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Choose Brand Color Palette"
            >
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsThemeMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Accent Theme
                </div>
                <div className="space-y-1 mt-1">
                  {THEME_ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAccent(opt.id)
                        setIsThemeMenuOpen(false)
                        toast.success(`Theme palette changed to ${opt.name}`)
                      }}
                      className={cn(
                        'flex items-center justify-between w-full p-2 rounded-xl text-xs transition-colors text-left',
                        accent === opt.id
                          ? 'bg-primary/15 text-primary font-bold'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3 w-3 rounded-full ring-2 ring-border shrink-0"
                          style={{ backgroundColor: opt.primaryHex }}
                        />
                        <span>{opt.name}</span>
                      </div>
                      {accent === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Icon */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/80 transition-colors hidden sm:inline-flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-4.5 w-4.5" />
            ) : (
              <Maximize className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Active Windows Sessions Monitor */}
          <div className="relative hidden xl:block">
            <button
              type="button"
              onClick={() => {
                setIsSessionsOpen(!isSessionsOpen)
                setIsProfileOpen(false)
                setIsRoleDropdownOpen(false)
                setIsThemeMenuOpen(false)
              }}
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Active Windows Login Sessions"
            >
              <Monitor className="h-4.5 w-4.5 text-foreground/80" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>

            {isSessionsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-popover p-0 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                onMouseLeave={() => setIsSessionsOpen(false)}
              >
                <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/40">
                  <div>
                    <span className="text-xs font-bold text-foreground">Active Sessions ({sessions.length})</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Windows & Device Access Tokens</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    SSL SECURED
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground text-xs">{sess.os}</span>
                          {sess.isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Login: <span className="font-mono text-foreground/80">{sess.loginAt}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">IP: {sess.ip}</p>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleTerminateSession(sess.id, sess.os)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                          title="Revoke session token"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Super Admin User Profile Pill (Matches User Reference Image) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen)
                setIsRoleDropdownOpen(false)
                setIsThemeMenuOpen(false)
              }}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/60 transition-colors"
            >
              <div className="hidden sm:flex flex-col text-right leading-none">
                <span className="text-xs font-bold text-foreground">
                  {user?.name || 'Super Admin'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  VLocker HQ · Main Control
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md ring-2 ring-indigo-500/30">
                SA
              </div>
            </button>

            {isProfileOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-bold text-foreground">
                    {user?.name || 'Super Admin'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email || 'vlocker@gmail.com'}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    SUPER ADMIN · HQ
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-500/10 font-bold transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Bulk Generate Modal */}
      {isBulkGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Bulk Generate License Keys</h3>
                  <p className="text-xs text-muted-foreground">Mint new keys directly into the Central Vault</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkGenerateOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Number of Keys to Mint
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 500"
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  {[50, 100, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBulkCount(preset)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                        bulkCount === preset
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Batch Reference Note
                </label>
                <input
                  type="text"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. October 2026 Stockist Allocation"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBulkGenerateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkGenerating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isBulkGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isBulkGenerating ? 'Minting Keys...' : `Mint ${bulkCount} Keys`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
