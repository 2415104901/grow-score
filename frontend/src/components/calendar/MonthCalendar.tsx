import { eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns'
import DayCell from './DayCell'
import type { DailyScore } from '../../types'

interface MonthCalendarProps {
  year: number
  month: number
  scores: DailyScore[]
  childId: string
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export default function MonthCalendar({ year, month, scores, childId }: MonthCalendarProps) {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Map date string → daily net score
  const scoreMap = new Map<string, number>()
  for (const s of scores) {
    scoreMap.set(s.date, s.daily_net)
  }

  // Leading empty cells to align with day-of-week (Sunday = 0)
  const leadingEmpties = getDay(monthStart)

  return (
    <div>
      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-xs font-medium text-slate-400">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: leadingEmpties }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Day cells */}
        {days.map((day) => {
          const dateStr = day.toISOString().slice(0, 10)
          const score = scoreMap.get(dateStr)
          return (
            <DayCell key={dateStr} day={day} score={score} childId={childId} />
          )
        })}
      </div>
    </div>
  )
}
