import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import { signIn } from '../services/auth'

function mapAuthError(err: unknown): string {
  if (!err || typeof err !== 'object') return '账号或密码错误'
  const e = err as { status?: number; message?: string; code?: string }
  if (e.status === 429 || e.code === 'over_request_rate_limit') {
    return '登录失败次数过多，请稍后重试'
  }
  const msg = (e.message ?? '').toLowerCase()
  if (msg.includes('banned') || msg.includes('disabled') || msg.includes('not allowed')) {
    return '账号已停用，请联系管理员'
  }
  return '账号或密码错误'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(email: string, password: string) {
    setIsLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#fdf8f0] px-6 py-8">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #d4b896 1.3px, transparent 1.3px)',
          backgroundSize: '26px 26px',
        }}
      />
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(253,230,138,0.6) 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,243,208,0.5) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 w-full max-w-[320px]">
        {/* Logo area */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{
              background: 'linear-gradient(145deg, #fbbf24, #f59e0b)',
              boxShadow: '0 8px 32px rgba(245,158,11,0.45), 0 2px 8px rgba(245,158,11,0.2)',
            }}
          >
            ⭐
          </div>
          <div className="text-center">
            <h1 className="text-[2rem] font-black tracking-tight text-[#1c1917]">积分管理</h1>
            <p className="mt-0.5 text-sm font-bold text-[#b89c6e]">家庭积分助手</p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl bg-white px-8 py-8"
          style={{
            boxShadow: '0 8px 48px rgba(180,130,40,0.14), 0 1px 4px rgba(180,130,40,0.08)',
            border: '1.5px solid #f0e0c0',
          }}
        >
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-[#cbb899]">© 2025 家庭积分助手</p>
      </div>
    </div>
  )
}
