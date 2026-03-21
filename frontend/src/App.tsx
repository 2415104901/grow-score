import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AuthGuard from './components/auth/AuthGuard'
import ParentOnlyGuard from './components/auth/ParentOnlyGuard'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CalendarPage from './pages/CalendarPage'
import DayDetailPage from './pages/DayDetailPage'
import RulesPage from './pages/RulesPage'
import ChildrenPage from './pages/ChildrenPage'
import RoleRedirect from './components/auth/RoleRedirect'

/** Layout route: AuthGuard + AppLayout wrapping all protected pages via <Outlet /> */
function ProtectedLayout() {
  return (
    <AuthGuard>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 已认证路由（AuthGuard + AppLayout 布局） */}
      <Route element={<ProtectedLayout />}>
        {/* 角色跳转：登录后 / 默认跳转 */}
        <Route index element={<RoleRedirect />} />

        {/* parent 专属首页 */}
        <Route
          path="/home"
          element={
            <ParentOnlyGuard>
              <HomePage />
            </ParentOnlyGuard>
          }
        />

        {/* 孩子视图（parent 和 child 均可访问） */}
        <Route path="/child/:childId/calendar" element={<CalendarPage />} />
        <Route path="/child/:childId/day/:date" element={<DayDetailPage />} />

        {/* parent 专属路由 */}
        <Route
          path="/rules"
          element={
            <ParentOnlyGuard>
              <RulesPage />
            </ParentOnlyGuard>
          }
        />
        <Route
          path="/children"
          element={
            <ParentOnlyGuard>
              <ChildrenPage />
            </ParentOnlyGuard>
          }
        />
      </Route>

      {/* 兜底 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


