import type { FormEvent } from 'react'
import { useState } from 'react'

interface ChildFormProps {
  onSubmit: (name: string) => void
  onCancel: () => void
  isLoading: boolean
}

export default function ChildForm({ onSubmit, onCancel, isLoading }: ChildFormProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[#7a6348]">孩子姓名</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          placeholder="例如：小明"
          className="rounded-xl border border-[#e8d9c0] bg-[#fdfaf6] px-3.5 py-[18px] text-sm outline-none
            placeholder:text-[#cbb99a] text-[#1c1917] transition-all
            focus:border-[#f59e0b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(253,230,138,0.45)]
            disabled:cursor-not-allowed disabled:opacity-55"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-[#e8d9c0] py-[15px] text-sm font-bold
            text-[#8b7355] transition-all hover:bg-[#fdf3e3] disabled:opacity-60"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="flex-1 rounded-xl py-[15px] text-sm font-black text-white transition-all
            hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
        >
          {isLoading ? '添加中…' : '添加'}
        </button>
      </div>
    </form>
  )
}
