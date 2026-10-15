import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { NAVIGATION_CONFIG } from '@/config/navigation.config'
import { hasPermission } from '@/config/permissions'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { logout } from '@/features/auth/slices/authSlice'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:static shadow-sm',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/80">
          <NavLink
            to="/app/overview"
            className="flex items-center gap-3 overflow-hidden select-none"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 shadow-md shadow-primary/20">
              <span className="text-lg font-black text-white font-display">V</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight font-display text-sidebar-foreground">
                  V-Credit
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Admin Console
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAVIGATION_CONFIG.map((section, idx) => {
            // Filter section items based on user role permissions
            const allowedItems = section.items.filter((item) => {
              if (!item.requiredPermission) return true
              return hasPermission(user?.role, item.requiredPermission)
            })

            if (allowedItems.length === 0) return null

            return (
              <div key={idx} className="space-y-1">
                {section.title && !isCollapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                    {section.title}
                  </p>
                )}

                <div className="space-y-1">
                  {allowedItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                            isCollapsed && 'justify-center px-2'
                          )
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                        {!isCollapsed && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badgeColor || 'secondary'}
                                className="text-[10px] px-1.5 py-0 h-4"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* User Card / Footer */}
        <div className="border-t border-sidebar-border/80 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl p-2 bg-sidebar-accent/50',
              isCollapsed && 'justify-center p-1.5'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-xs uppercase">
              {user?.name ? user.name.slice(0, 2) : 'VC'}
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-bold text-sidebar-foreground">
                  {user?.name || 'V-Credit User'}
                </p>
                <p className="truncate text-[11px] capitalize text-muted-foreground">
                  {user?.role ? user.role.replace('_', ' ') : 'Administrator'}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
