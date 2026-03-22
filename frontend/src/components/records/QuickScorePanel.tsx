import { useState } from 'react'
import type { Rule } from '../../types'

interface QuickScorePanelProps {
  rules: Rule[]
  onSubmit: (selectedRuleIds: string[]) => void
  onCancel: () => void
  isSubmitting: boolean
}

export default function QuickScorePanel({
  rules,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuickScorePanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const positiveRules = rules.filter((r) => r.score > 0)
  const negativeRules = rules.filter((r) => r.score < 0)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const delta = rules
    .filter((r) => selected.has(r.id))
    .reduce((sum, r) => sum + r.score, 0)

  const hasSelection = selected.size > 0

  function handleSubmit() {
    if (!hasSelection) return
    onSubmit(Array.from(selected))
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200" style={{ maxHeight: '80dvh' }}>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">选择规则</h3>

      {/* Buttons at top - always accessible */}
      <div className="mb-3 flex gap-2 shrink-0">
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
          disabled={!hasSelection || isSubmitting}
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
          {isSubmitting ? '提交中…' : '提交'}
        </button>
      </div>

      {/* Delta preview - show score change as user selects */}
      {hasSelection && (
        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm shrink-0">
          <span className="text-slate-500">本次变化：</span>
          <span
            className={`ml-1 font-bold tabular-nums ${
              delta >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {delta >= 0 ? '+' : ''}
            {delta} 分
          </span>
        </div>
      )}

      {/* Scrollable rule list - fills remaining space */}
      <div className="flex-1 overflow-y-auto px-1 min-h-0">
        {positiveRules.length > 0 && (
          <section className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-green-600">
              加分规则
            </p>
            <div className="flex flex-col gap-2">
              {positiveRules.map((rule) => (
                <RuleCheckRow
                  key={rule.id}
                  rule={rule}
                  checked={selected.has(rule.id)}
                  onChange={() => toggle(rule.id)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </section>
        )}

        {negativeRules.length > 0 && (
          <section className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-500">扣分规则</p>
            <div className="flex flex-col gap-2">
              {negativeRules.map((rule) => (
                <RuleCheckRow
                  key={rule.id}
                  rule={rule}
                  checked={selected.has(rule.id)}
                  onChange={() => toggle(rule.id)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function RuleCheckRow({
  rule,
  checked,
  onChange,
  disabled,
}: {
  rule: Rule
  checked: boolean
  onChange: () => void
  disabled: boolean
}) {
  const isPositive = rule.score > 0
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors
        ${checked ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-slate-50 hover:bg-slate-100'}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-indigo-600"
      />
      <span className="flex-1 text-sm text-slate-700">{rule.name}</span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          isPositive ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {isPositive ? '+' : ''}
        {rule.score}
      </span>
    </label>
  )
}
