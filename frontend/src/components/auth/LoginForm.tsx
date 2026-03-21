import type { FormEvent } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
  isLoading: boolean
  error: string | null
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        disabled={isLoading}
        className="w-full rounded-2xl border-2 border-[#eddcc4] bg-[#fdf9f5] px-5 py-[21px] text-sm
          text-[#1c1917] outline-none transition-all placeholder:text-[#c5ab8a]
          focus:border-[#f59e0b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(253,230,138,0.35)]
          disabled:cursor-not-allowed disabled:opacity-55
          [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#fdf9f5] [&:-webkit-autofill]:[color:#1c1917]"
        placeholder="请输入邮箱"
      />

      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        disabled={isLoading}
        className="w-full rounded-2xl border-2 border-[#eddcc4] bg-[#fdf9f5] px-5 py-[21px] text-sm
          text-[#1c1917] outline-none transition-all placeholder:text-[#c5ab8a]
          focus:border-[#f59e0b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(253,230,138,0.35)]
          disabled:cursor-not-allowed disabled:opacity-55
          [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#fdf9f5] [&:-webkit-autofill]:[color:#1c1917]"
        placeholder="请输入密码"
      />

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-600 ring-1 ring-red-100">
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-6 text-base
          font-black tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-55"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
          boxShadow: isLoading ? 'none' : '0 6px 24px rgba(245,158,11,0.5)',
        }}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isLoading ? '登录中…' : '登　录'}
      </button>
    </form>
  )
}
