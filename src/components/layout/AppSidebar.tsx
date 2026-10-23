import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronRight,
  LogOut,
  X,
  LayoutDashboard,
  BarChart3,
  UserPlus,
  Users,
  FileBarChart,
  Settings,
  FileDown,
  Menu,
  Building2,
  Store,
  Smartphone,
  MapPin,
  KeyRound,
  Layers,
  Coins,
  ShieldAlert,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { logout } from '@/features/auth/slices/authSlice'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { cn } from '@/lib/utils'
import { EmiSafeLogo } from '@/components/common/EmiSafeLogo'

interface AppSidebarProps {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  onOpenAgreement?: () => void
}

type AccordionKey = 'userList' | 'reports' | 'systemSetting' | null

export function AppSidebar({
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenAgreement,
}: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)

  // Auto-expand accordion based on active route
  const getInitialAccordion = (): AccordionKey => {
    const p = location.pathname
    if (
      p.includes('/distributors') ||
      p.includes('/dealers') ||
      p.includes('/users') ||
      p.includes('/pending-users') ||
      p.includes('/user-search')
    ) {
      return 'userList'
    }
    if (p.includes('/reports')) {
      return 'reports'
    }
    if (p.includes('/settings')) {
      return 'systemSetting'
    }
    return 'userList'
  }

  const [openAccordion, setOpenAccordion] = useState<AccordionKey>(getInitialAccordion)

  const toggleAccordion = (key: AccordionKey) => {
    setOpenAccordion((prev) => (prev === key ? null : key))
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate(ROUTE_PATHS.LOGIN)
  }

  const closeMobile = () => setIsMobileOpen(false)

  const role = user?.role || 'super_admin'
  const isSuper = role === 'super_admin'
  const isStockist = role === 'stockist' || isSuper
  const isDistributor = role === 'distributor' || isStockist
  const isDealer = role === 'dealer'
  const canAccessEmiSafe = isSuper || isDealer

  // Enterprise modern NavLink shared style (reduced radius, comfortable font size & spacing)
  const pillCls = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 select-none shadow-xs',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold'
        : 'text-foreground/80 hover:text-foreground hover:bg-muted/70'
    )

  // Sub-item style with clean rounded-lg and comfortable typography
  const yellowCls = (isActive: boolean) =>
    cn(
      'flex items-center w-full px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 select-none',
      isActive
        ? 'bg-primary/15 text-primary font-bold shadow-xs'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
    )

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out lg:static shadow-xl',
          'bg-card border-r border-border text-card-foreground',
          isCollapsed ? 'w-[84px]' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Header */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-border shrink-0 transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          <NavLink
            to={ROUTE_PATHS.OVERVIEW}
            onClick={closeMobile}
            className={cn(
              'flex items-center gap-3 overflow-hidden group',
              isCollapsed && 'justify-center'
            )}
            title="V-Credit Admin Console"
          >
            <EmiSafeLogo size={isCollapsed ? 42 : 38} className="shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col select-none">
                <span className="font-display font-black text-sm tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">
                  {user?.role === 'super_admin' ? 'SUPER ADMIN' :
                   user?.role === 'stockist' ? 'STOCKIEST' :
                   user?.role === 'distributor' ? 'DISTRIBUTOR' :
                   user?.role === 'dealer' ? 'DEALER' : 'V-CREDIT'}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-primary uppercase">
                  CONSOLE
                </span>
              </div>
            )}
          </NavLink>

          {/* Toggle sidebar button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
              className={cn(
                'p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors',
                isCollapsed ? 'hidden' : 'hidden lg:flex'
              )}
              title="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              onClick={closeMobile}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Collapsed expansion button */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-border/40">
            <button
              type="button"
              onClick={() => setIsCollapsed && setIsCollapsed(false)}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Expand sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Super Admin / Partner Profile Card matching image */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 mb-1 p-2.5 rounded-xl bg-muted/60 border border-border/60 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-black text-xs flex items-center justify-center shrink-0 uppercase">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">{user?.email || 'vlocker@gmail.com'}</p>
            </div>
          </div>
        )}

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* DASHBOARD */}
          <NavLink
            to={ROUTE_PATHS.OVERVIEW}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Dashboard Overview"
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0 text-primary" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* ONBOARD NEW PARTNER (Directly below Dashboard as requested) */}
          <NavLink
            to={ROUTE_PATHS.ADD_DISTRIBUTOR}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Onboard New Partner"
          >
            <UserPlus className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
            {!isCollapsed && <span>Add Partner</span>}
          </NavLink>

          {/* ANALYTICS (Directly below Add Partner as requested) */}
          <NavLink
            to={ROUTE_PATHS.ANALYTICS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Analytics Telemetry"
          >
            <BarChart3 className="h-4.5 w-4.5 shrink-0 text-violet-500" />
            {!isCollapsed && <span>Analytics</span>}
          </NavLink>

          {/* STOCKISTS (Super Admin only - Tier 1) */}
          {isSuper && (
            <NavLink
              to={ROUTE_PATHS.STOCKISTS}
              onClick={closeMobile}
              className={({ isActive }) => pillCls(isActive)}
              title="Stockists Distribution Network"
            >
              <Building2 className="h-4.5 w-4.5 shrink-0 text-blue-500" />
              {!isCollapsed && <span>Stockists</span>}
            </NavLink>
          )}

          {/* DISTRIBUTORS (Super Admin & Stockist) */}
          {isStockist && (
            <NavLink
              to={ROUTE_PATHS.DISTRIBUTORS}
              onClick={closeMobile}
              className={({ isActive }) => pillCls(isActive)}
              title="Distributor Partners"
            >
              <Users className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
              {!isCollapsed && <span>Distributors</span>}
            </NavLink>
          )}

          {/* DEALERS (Retail Outlets) */}
          <NavLink
            to={ROUTE_PATHS.DEALERS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Retail Dealers"
          >
            <Store className="h-4.5 w-4.5 shrink-0 text-amber-500" />
            {!isCollapsed && <span>Dealers</span>}
          </NavLink>

          {/* END USERS (Customers / Borrowers) */}
          <NavLink
            to={ROUTE_PATHS.USERS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Enrolled End Users & Devices"
          >
            <Smartphone className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
            {!isCollapsed && <span>End Users</span>}
          </NavLink>

          {/* EMI SAFE (Super Admin & Dealer Only) */}
          {canAccessEmiSafe && (
            <NavLink
              to={ROUTE_PATHS.EMI_SAFE}
              onClick={closeMobile}
              className={({ isActive }) => pillCls(isActive)}
              title="EMI Safe - Industry-Standard EMI & Installment Management"
            >
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>EMI Safe</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
              )}
            </NavLink>
          )}

          {/* REPORTS - Accordion (Placed directly below End Users as requested) */}
          {isDistributor && !isCollapsed && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleAccordion('reports')}
                className={cn(
                  'flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs',
                  openAccordion === 'reports'
                    ? 'bg-muted/80 text-foreground font-bold'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <FileBarChart className="h-5 w-5 shrink-0 text-primary" />
                  <span>Reports</span>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform duration-200 text-muted-foreground',
                    openAccordion === 'reports' ? 'rotate-90' : ''
                  )}
                />
              </button>

              {openAccordion === 'reports' && (
                <div className="ml-3 space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {isSuper && (
                    <NavLink to={ROUTE_PATHS.REPORT_STOCKIST_LOW_KEY} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                      Stockist Low-Key Report
                    </NavLink>
                  )}
                  <NavLink to={ROUTE_PATHS.REPORT_DISTRIBUTOR_LOW_KEY} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Distributor Low-Key Report
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.REPORT_DEALER_LOW_KEY} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Dealer Low-Key Report
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.REPORT_TRANSFER} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Key Transfer Report
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.REPORT_RECEIVED_KEY} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Received Key Report
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.REPORT_IPHONE_TRANSFER} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    iPhone Key Transfer Report
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.REPORT_IPHONE_RECEIVED} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    iPhone Key Received
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* TERRITORIES (Super Admin) */}
          {isSuper && (
            <NavLink
              to={ROUTE_PATHS.TERRITORIES}
              onClick={closeMobile}
              className={({ isActive }) => pillCls(isActive)}
              title="Territories & Regional Coverage"
            >
              <MapPin className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              {!isCollapsed && <span>Territories</span>}
            </NavLink>
          )}

          {/* KEY MANAGEMENT */}
          <NavLink
            to={ROUTE_PATHS.KEYS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="License Key Minting & Allocation"
          >
            <KeyRound className="h-4.5 w-4.5 shrink-0 text-primary" />
            {!isCollapsed && <span>Key Management</span>}
          </NavLink>

          {/* INVENTORY (Super Admin Only) */}
          {isSuper && (
            <NavLink
              to={ROUTE_PATHS.INVENTORY}
              onClick={closeMobile}
              className={({ isActive }) => pillCls(isActive)}
              title="Vault Inventory"
            >
              <Layers className="h-4.5 w-4.5 shrink-0 text-cyan-500" />
              {!isCollapsed && <span>Inventory</span>}
            </NavLink>
          )}

          {/* COMMISSIONS (Accessible to Super Admin, Stockist, Distributor, Dealer) */}
          <NavLink
            to={ROUTE_PATHS.COMMISSIONS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Hierarchy Commission Ledgers"
          >
            <Coins className="h-4.5 w-4.5 shrink-0 text-yellow-500" />
            {!isCollapsed && <span>Commissions</span>}
          </NavLink>

          {/* NOTIFICATIONS */}
          <NavLink
            to={ROUTE_PATHS.NOTIFICATIONS}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="System & Quota Notifications"
          >
            <Bell className="h-4.5 w-4.5 shrink-0 text-sky-500" />
            {!isCollapsed && <span>Notifications</span>}
          </NavLink>

          {/* AUDIT LOGS */}
          <NavLink
            to={ROUTE_PATHS.AUDIT}
            onClick={closeMobile}
            className={({ isActive }) => pillCls(isActive)}
            title="Immutable Security Audit Logs"
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
            {!isCollapsed && <span>Audit Logs</span>}
          </NavLink>

          {/* SYSTEM SETTING - Accordion */}
          {isSuper && !isCollapsed && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleAccordion('systemSetting')}
                className={cn(
                  'flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs',
                  openAccordion === 'systemSetting'
                    ? 'bg-muted/80 text-foreground font-bold'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 shrink-0 text-primary" />
                  <span>System Setting</span>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform duration-200 text-muted-foreground',
                    openAccordion === 'systemSetting' ? 'rotate-90' : ''
                  )}
                />
              </button>

              {openAccordion === 'systemSetting' && (
                <div className="ml-3 space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <NavLink to={ROUTE_PATHS.SETTINGS} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Theme & Platform Settings
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.SETTING_KEY_PRICE} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    Key Price Setting
                  </NavLink>
                  <NavLink to={ROUTE_PATHS.SETTING_IPHONE_KEY_PRICE} onClick={closeMobile} className={({ isActive }) => yellowCls(isActive)}>
                    iPhone Key Price Setting
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* DOWNLOAD AGREEMENT */}
          <div className="flex items-center gap-1">
            <NavLink
              to={ROUTE_PATHS.DOWNLOAD_AGREEMENT}
              onClick={closeMobile}
              className={({ isActive }) => cn(pillCls(isActive), onOpenAgreement && !isCollapsed && 'flex-1')}
              title="Download Legal Agreement"
            >
              <FileDown className="h-5 w-5 shrink-0 text-primary" />
              {!isCollapsed && <span>Download Agreement</span>}
            </NavLink>
            {onOpenAgreement && !isCollapsed && (
              <button
                type="button"
                onClick={onOpenAgreement}
                title="Quick View Agreement Modal"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary/15 text-primary hover:bg-primary/25 transition-colors shrink-0"
              >
                View
              </button>
            )}
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t border-border p-3 shrink-0">
          <div className={cn('flex items-center gap-3 rounded-2xl p-2 bg-muted/50 border border-border/50', isCollapsed && 'justify-center p-1.5')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black text-xs uppercase shadow-xs">
              {user?.name ? user.name.slice(0, 2) : 'VC'}
            </div>

            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden text-left">
                <span className="truncate text-xs font-bold text-foreground">
                  {user?.name || 'Stockist Admin'}
                </span>
                <span className="truncate text-[10px] text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ') || 'Stockist'}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
