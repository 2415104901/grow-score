import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface ParentOnlyGuardProps {
  children: ReactNode
}

export default function ParentOnlyGuard({ children }: ParentOnlyGuardProps) {
  const { role, childId } = useAuth()

  if (role === 'child') {
    return <Navigate to={`/child/${childId}/calendar`} replace />
  }

  return <>{children}</>
}
