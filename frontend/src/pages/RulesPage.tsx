import { useState } from 'react'
import { useAllRules, useCreateRule, useUpdateRule, useToggleRule, useDeleteRule } from '../hooks/useRules'
import RuleList from '../components/rules/RuleList'
import RuleForm from '../components/rules/RuleForm'
import type { Rule } from '../types'

export default function RulesPage() {
  const { data: rules, isLoading } = useAllRules()
  const createRule = useCreateRule()
  const updateRule = useUpdateRule()
  const toggleRule = useToggleRule()
  const deleteRule = useDeleteRule()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)

  async function handleCreate(name: string, score: number) {
    await createRule.mutateAsync({ name, score })
    setShowCreateForm(false)
  }

  async function handleUpdate(name: string, score: number) {
    if (!editingRule) return
    await updateRule.mutateAsync({ id: editingRule.id, name, score })
    setEditingRule(null)
  }

  async function handleToggle(rule: Rule) {
    await toggleRule.mutateAsync({ id: rule.id, isActive: !rule.is_active })
  }

  async function handleDelete(rule: Rule) {
    if (!window.confirm(`确定删除规则"${rule.name}"？历史记录的快照数据不受影响。`)) return
    await deleteRule.mutateAsync(rule.id)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[#1c1917]">规则管理</h2>
        {!showCreateForm && !editingRule && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-full px-4 py-[9px] text-sm font-black text-white transition-all
              hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 3px 12px rgba(245,158,11,0.4)' }}
          >
            + 新增规则
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
          <p className="mb-3 text-sm font-bold text-[#7a6348]">新增规则</p>
          <RuleForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createRule.isPending}
          />
        </div>
      )}

      {/* Edit form */}
      {editingRule && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
          <p className="mb-3 text-sm font-bold text-[#7a6348]">编辑规则</p>
          <RuleForm
            initialName={editingRule.name}
            initialScore={editingRule.score}
            onSubmit={handleUpdate}
            onCancel={() => setEditingRule(null)}
            isLoading={updateRule.isPending}
          />
        </div>
      )}

      <RuleList
        rules={rules ?? []}
        onEdit={(rule) => {
          setShowCreateForm(false)
          setEditingRule(rule)
        }}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  )
}
