import { useState } from 'react'
import { useChildren, useCreateChild, useHideChild } from '../hooks/useChildren'
import ChildForm from '../components/children/ChildForm'

export default function ChildrenPage() {
  const { data: children, isLoading } = useChildren()
  const createChild = useCreateChild()
  const hideChild = useHideChild()
  const [showForm, setShowForm] = useState(false)

  async function handleCreate(name: string) {
    await createChild.mutateAsync(name)
    setShowForm(false)
  }

  async function handleHide(id: string, name: string) {
    if (!window.confirm(`确定隐藏孩子"${name}"？历史积分记录将完整保留。`)) return
    await hideChild.mutateAsync(id)
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
        <h2 className="text-xl font-black text-[#1c1917]">孩子管理</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full px-4 py-[9px] text-sm font-black text-white transition-all
              hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 3px 12px rgba(245,158,11,0.4)' }}
          >
            + 新增孩子
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
          <p className="mb-3 text-sm font-bold text-[#7a6348]">添加孩子</p>
          <ChildForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={createChild.isPending}
          />
        </div>
      )}

      {/* Children list */}
      {(!children || children.length === 0) && !showForm ? (
        <p className="py-12 text-center text-sm font-semibold text-[#c9b99a]">暂无孩子档案，点击上方按鈕添加 👬</p>
      ) : (
        <div className="flex flex-col gap-2">
          {(children ?? []).map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5
                shadow-sm ring-1 ring-amber-100 transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-800">{child.name}</span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    child.total_score >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {child.total_score >= 0 ? '+' : ''}
                  {child.total_score} 分
                </span>
              </div>
              <button
                onClick={() => handleHide(child.id, child.name)}
                disabled={hideChild.isPending}
                className="rounded-full border border-[#e8d9c0] px-3 py-[9px] text-xs font-bold text-[#8b7355]
                  transition-all hover:bg-[#fdf3e3] disabled:opacity-60"
              >
                隐藏
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
