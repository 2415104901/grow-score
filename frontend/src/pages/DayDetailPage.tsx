import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDayRecords, useInsertRecords } from '../hooks/useRecords'
import { useRules } from '../hooks/useRules'
import RecordTimeline from '../components/records/RecordTimeline'
import QuickScorePanel from '../components/records/QuickScorePanel'
import type { InsertRecordInput } from '../types'

export default function DayDetailPage() {
  const { childId = '', date = '' } = useParams<{ childId: string; date: string }>()
  const [searchParams] = useSearchParams()
  const autoOpen = searchParams.get('autoOpen') === 'true'

  const { role, profile } = useAuth()
  const isParent = role === 'parent'

  const { data: records, isLoading: recordsLoading } = useDayRecords(childId, date)
  const { data: rules } = useRules()
  const insertRecords = useInsertRecords(childId, date)

  const [panelOpen, setPanelOpen] = useState(autoOpen)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const dailyNet = (records ?? []).reduce((sum, r) => sum + r.score_snapshot, 0)

  async function handleSubmit(selectedRuleIds: string[]) {
    if (!profile) return
    setSubmitError(null)
    const selected = (rules ?? []).filter((r) => selectedRuleIds.includes(r.id))
    const payload: InsertRecordInput[] = selected.map((r) => ({
      child_id: childId,
      rule_id: r.id,
      rule_name_snapshot: r.name,
      score_snapshot: r.score,
      date,
      created_by: profile.user_id,
    }))
    try {
      await insertRecords.mutateAsync(payload)
      setPanelOpen(false)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'PermissionError'
          ? '权限不足，无法写入数据'
          : '提交失败，请重试'
      setSubmitError(msg)
    }
  }

  // Format date for display: yyyy-MM-dd → M月D日 (周X)
  function formatDateTitle(iso: string) {
    const d = new Date(iso + 'T00:00:00')
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `${d.getMonth() + 1}月${d.getDate()}日（周${days[d.getDay()]}）`
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">{date ? formatDateTitle(date) : ''}</h2>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">当日净分</span>
          <span
            className={`text-lg font-bold tabular-nums ${
              dailyNet >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {dailyNet >= 0 ? '+' : ''}
            {dailyNet}
          </span>
        </div>
      </div>

      {/* Records timeline */}
      {recordsLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <RecordTimeline records={records ?? []} />
      )}

      {/* Parent-only: add record button + panel */}
      {isParent && (
        <div className="mt-2">
          {submitError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          )}
          {panelOpen ? (
            <QuickScorePanel
              rules={rules ?? []}
              onSubmit={handleSubmit}
              onCancel={() => {
                setPanelOpen(false)
                setSubmitError(null)
              }}
              isSubmitting={insertRecords.isPending}
            />
          ) : (
            <button
              onClick={() => setPanelOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2
                border-dashed border-indigo-300 py-3 text-sm font-medium text-indigo-600
                transition-colors hover:border-indigo-400 hover:bg-indigo-50"
            >
              <span className="text-lg leading-none">＋</span>
              新增记录
            </button>
          )}
        </div>
      )}
    </div>
  )
}
