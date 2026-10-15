import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { ROUTE_PATHS } from './routePaths'
import type { Permission, UserRole } from '@/types/user'
import { Button } from '@/components/ui/Button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requiredRole?: UserRole
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />
  }

  // Role check
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldX className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Access Restricted
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Your current persona ({user?.role?.replace('_', ' ')}) is not authorized to access this module.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Permission check
  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldX className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Permission Required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          You lack the permission: <code className="font-mono text-xs text-primary">{requiredPermission}</code> to view this operational record.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
