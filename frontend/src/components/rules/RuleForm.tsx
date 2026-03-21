import { useState, type FormEvent } from 'react'

interface RuleFormProps {
  initialName?: string
  initialScore?: number
  onSubmit: (name: string, score: number) => void
  onCancel: () => void
  isLoading: boolean
}

export default function RuleForm({
  initialName = '',
  initialScore = 1,
  onSubmit,
  onCancel,
  isLoading,
}: RuleFormProps) {
  const [name, setName] = useState(initialName)
  const [score, setScore] = useState<number | ''>(initialScore)
  const [scoreError, setScoreError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (score === '' || score === 0) {
      setScoreError('分值不能为 0')
      return
    }
    setScoreError(null)
    onSubmit(name.trim(), score)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[#7a6348]">规则名称</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          placeholder="例如：按时完成作业"
          className="rounded-xl border border-[#e8d9c0] bg-[#fdfaf6] px-3.5 py-[18px] text-sm outline-none
            placeholder:text-[#cbb99a] text-[#1c1917] transition-all
            focus:border-[#f59e0b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(253,230,138,0.45)]
            disabled:cursor-not-allowed disabled:opacity-55"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[#7a6348]">分值（非零整数，正数加分，负数扣分）</label>
        <input
          type="number"
          required
          value={score}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : Number(e.target.value)
            setScore(val)
            if (val !== '' && val !== 0) setScoreError(null)
          }}
          disabled={isLoading}
          placeholder="例如：2 或 -2"
          className="rounded-xl border border-[#e8d9c0] bg-[#fdfaf6] px-3.5 py-[18px] text-sm outline-none
            placeholder:text-[#cbb99a] text-[#1c1917] transition-all
            focus:border-[#f59e0b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(253,230,138,0.45)]
            disabled:cursor-not-allowed disabled:opacity-55"
        />
        {scoreError && <p className="text-xs text-red-500">{scoreError}</p>}
      </div>

      <div className="flex gap-2 pt-1">
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
          disabled={isLoading || !name.trim() || score === '' || score === 0}
          className="flex-1 rounded-xl py-[15px] text-sm font-black text-white transition-all
            hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
        >
          {isLoading ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  )
}
