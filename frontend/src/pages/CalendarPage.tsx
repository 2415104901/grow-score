import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { useChildren } from '../hooks/useChildren'
import { useMonthlyScores } from '../hooks/useRecords'
import MonthCalendar from '../components/calendar/MonthCalendar'

export default function CalendarPage() {
  const { childId = '' } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data: children } = useChildren()
  const child = children?.find((c) => c.id === childId)

  const { data: scores, isLoading } = useMonthlyScores(childId, year, month)

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  function handleFab() {
    const todayStr = format(today, 'yyyy-MM-dd')
    navigate(`/child/${childId}/day/${todayStr}?autoOpen=true`)
  }

  const totalScore = child?.total_score ?? 0
  const isPositive = totalScore >= 0

  return (
    <div className="relative flex flex-col gap-4 p-4 pb-20">
      {/* Child name + total score header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          {child?.name ?? '加载中…'}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">总分</span>
          <span
            className={`text-lg font-bold tabular-nums ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {isPositive ? '+' : ''}
            {totalScore}
          </span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-[#8b7355]
            transition-all hover:bg-amber-100 active:bg-amber-200"
          aria-label="上月"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-slate-700">
          {year} 年 {month} 月
        </span>
        <button
          onClick={nextMonth}
          className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-[#8b7355]
            transition-all hover:bg-amber-100 active:bg-amber-200"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <MonthCalendar
          year={year}
          month={month}
          scores={scores ?? []}
          childId={childId}
        />
      )}

      {/* FAB: parent only */}
      {role === 'parent' && (
        <button
          onClick={handleFab}
          className="fixed bottom-[84px] right-4 flex h-14 w-14 items-center justify-center
            rounded-full text-2xl text-white shadow-xl transition-all
            hover:scale-105 active:scale-90 sm:bottom-6 sm:right-6"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 6px 24px rgba(245,158,11,0.55)' }}
          aria-label="新增记录"
        >
          ＋
        </button>
      )}
    </div>
  )
}
