import type { ReactNode } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'

interface AppLayoutProps {
  children: ReactNode
}

function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function RulesIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function ChildrenIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function LogoutIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

interface MobileTabLinkProps {
  to: string
  icon: ReactNode
  label: string
  end?: boolean
}

function MobileTabLink({ to, icon, label, end }: MobileTabLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-bold transition-all active:scale-90 ${
          isActive ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`rounded-2xl p-1.5 transition-all ${isActive ? 'bg-amber-100' : ''}`}>
            {icon}
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { role } = useAuth()

  async function handleSignOut() {
    await signOut()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#fdf8f0' }}>
      {/* ── Top header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 sm:px-6"
        style={{
          background: 'linear-gradient(90deg, #1e1b4b 0%, #2d3a8c 100%)',
          boxShadow: '0 2px 20px rgba(30,27,75,0.45)',
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-xl px-2 py-1 text-white transition-all hover:bg-white/10 active:scale-95"
        >
          <span className="text-xl">⭐</span>
          <span className="text-base font-black tracking-tight">积分管理</span>
        </NavLink>

        {/* Desktop nav — visible on sm+ (≥640px) only */}
        <nav className="hidden shrink-0 items-center gap-3 sm:flex">
          {role === 'parent' && (
            <>
              <NavLink
                to="/rules"
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-stone-900 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <RulesIcon size={14} />
                规则管理
              </NavLink>
              <NavLink
                to="/children"
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-stone-900 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <ChildrenIcon size={14} />
                孩子管理
              </NavLink>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="ml-2 flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 px-6 py-2.5 text-sm font-bold text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon size={14} />
            退出登录
          </button>
        </nav>
        </div>
      </header>

      {/* ── Page content — bottom padding on mobile for tab bar */}
      <main className="w-full max-w-5xl self-center flex-1 pb-[72px] sm:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom tab bar — hidden on sm+ ─────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-stretch sm:hidden"
        style={{
          background: 'rgba(253,248,240,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1.5px solid rgba(180,130,40,0.15)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          minHeight: '64px',
        }}
      >
        <MobileTabLink to="/" icon={<HomeIcon />} label="首页" end />
        {role === 'parent' && (
          <>
            <MobileTabLink to="/rules" icon={<RulesIcon />} label="规则" />
            <MobileTabLink to="/children" icon={<ChildrenIcon />} label="孩子" />
          </>
        )}
        <button
          onClick={handleSignOut}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-bold text-stone-400 transition-all hover:text-red-500 active:scale-90"
        >
          <LogoutIcon />
          <span>退出</span>
        </button>
      </nav>
    </div>
  )
}
