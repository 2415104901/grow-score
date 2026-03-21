import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function RoleRedirect() {
  const { role, childId, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (role === 'child' && childId) {
    return <Navigate to={`/child/${childId}/calendar`} replace />
  }

  return <Navigate to="/home" replace />
}
