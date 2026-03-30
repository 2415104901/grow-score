import { useState } from 'react'
import {
  validateRedemptionAmount,
  validateSufficientBalance,
  calculateMoneyAmount,
} from '../../hooks/useRedemption'

interface RedemptionPanelProps {
  currentBalance: number
  onSubmit: (points: number) => void
  onCancel: () => void
  isSubmitting: boolean
}

const PRESETS = [
  { points: 5, label: '5积分 → ¥1' },
  { points: 10, label: '10积分 → ¥2' },
  { points: 25, label: '25积分 → ¥5' },
  { points: 50, label: '50积分 → ¥10' },
  { points: 100, label: '100积分 → ¥20' },
]

export default function RedemptionPanel({
  currentBalance,
  onSubmit,
  onCancel,
  isSubmitting,
}: RedemptionPanelProps) {
  const [points, setPoints] = useState<number | ''>('')
  const [error, setError] = useState<string>('')

  const moneyAmount = typeof points === 'number' ? calculateMoneyAmount(points) : 0

  function validate(): boolean {
    // Reset error
    setError('')

    if (points === '') {
      setError('请输入兑换积分')
      return false
    }

    const amountValidation = validateRedemptionAmount(points)
    if (!amountValidation.valid) {
      setError(amountValidation.error || '无效金额')
      return false
    }

    const balanceValidation = validateSufficientBalance(points, currentBalance)
    if (!balanceValidation.valid) {
      setError(balanceValidation.error || '余额不足')
      return false
    }

    return true
  }

  function handleSubmit() {
    if (!validate()) return
    if (typeof points === 'number') {
      onSubmit(points)
    }
  }

  function handlePresetClick(presetPoints: number) {
    setPoints(presetPoints)
    setError('')
  }

  const isValid = points !== '' && error === ''

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">兑换积分</h3>

      {/* Current balance display */}
      <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-500">当前余额：</span>
        <span className="ml-1 font-bold tabular-nums text-indigo-600">{currentBalance} 积分</span>
      </div>

      {/* Preset buttons */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-slate-500">快捷选择</p>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.points}
              onClick={() => handlePresetClick(preset.points)}
              disabled={isSubmitting || preset.points > currentBalance}
              className={`rounded-lg border py-2 text-xs font-medium transition-colors
                ${points === preset.points
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }
                ${preset.points > currentBalance ? 'cursor-not-allowed opacity-40' : ''}
                disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-slate-500">自定义金额</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={points}
            onChange={(e) => {
              const value = e.target.value
              setPoints(value === '' ? '' : Number(value))
              setError('')
            }}
            disabled={isSubmitting}
            placeholder="输入积分"
            min={5}
            step={5}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm
              focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
              disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex h-10 w-20 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
            {isValid && moneyAmount > 0 ? `¥${moneyAmount}` : '¥0'}
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* Preview */}
      {isValid && moneyAmount > 0 && (
        <div className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm">
          <span className="text-indigo-700">将兑换：</span>
          <span className="ml-1 font-bold tabular-nums text-indigo-700">
            ¥{moneyAmount}
          </span>
          <span className="ml-1 text-indigo-600">
            （-{points} 积分）
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium
            text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5
            text-sm font-semibold text-white transition-colors hover:bg-indigo-700
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isSubmitting ? '兑换中…' : '确认兑换'}
        </button>
      </div>
    </div>
  )
}
