import type { Rule } from '../../types'

interface RuleListProps {
  rules: Rule[]
  onEdit: (rule: Rule) => void
  onToggle: (rule: Rule) => void
  onDelete: (rule: Rule) => void
}

export default function RuleList({ rules, onEdit, onToggle, onDelete }: RuleListProps) {
  const positiveRules = rules.filter((r) => r.score > 0)
  const negativeRules = rules.filter((r) => r.score < 0)

  return (
    <div className="flex flex-col gap-6">
      {positiveRules.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
            加分规则
          </p>
          <div className="flex flex-col gap-2">
            {positiveRules.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}

      {negativeRules.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
            扣分规则
          </p>
          <div className="flex flex-col gap-2">
            {negativeRules.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}

      {rules.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-8">暂无规则，点击"新增规则"添加</p>
      )}
    </div>
  )
}

function RuleRow({
  rule,
  onEdit,
  onToggle,
  onDelete,
}: {
  rule: Rule
  onEdit: (r: Rule) => void
  onToggle: (r: Rule) => void
  onDelete: (r: Rule) => void
}) {
  const isPositive = rule.score > 0

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 transition-opacity
        ${rule.is_active ? 'bg-white ring-slate-200' : 'bg-slate-50 opacity-50 ring-slate-100'}`}
    >
      {/* Name + score */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="truncate text-sm text-slate-800">{rule.name}</span>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums
            ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
        >
          {isPositive ? '+' : ''}
          {rule.score}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Edit */}
        <button
          onClick={() => onEdit(rule)}
          aria-label="编辑"
          className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-500
            hover:bg-slate-100 hover:text-slate-700"
        >
          ✎
        </button>

        {/* Toggle active */}
        <button
          onClick={() => onToggle(rule)}
          aria-label={rule.is_active ? '停用' : '启用'}
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xs font-medium
            ${rule.is_active
              ? 'text-amber-600 hover:bg-amber-50'
              : 'text-green-600 hover:bg-green-50'
            }`}
        >
          {rule.is_active ? '⏸' : '▶'}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(rule)}
          aria-label="删除"
          className="flex h-12 w-12 items-center justify-center rounded-xl text-red-400
            hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
