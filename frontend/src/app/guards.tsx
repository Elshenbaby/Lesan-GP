import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeForRole, useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/domain'

/** Redirects to /login (remembering where the user wanted to go) when signed out. */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children ?? <Outlet />
}

/** Only lets the listed roles through; others are sent to their own home. */
export function RequireRole({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />
  return children ?? <Outlet />
}

/** Login/signup pages: signed-in users skip straight to their dashboard. */
export function GuestOnly({ children }: { children?: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return children ?? <Outlet />
}
