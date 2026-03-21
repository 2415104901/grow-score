import { useNavigate } from 'react-router-dom'
import { isToday } from 'date-fns'

interface DayCellProps {
  day: Date
  score?: number
  childId: string
}

export default function DayCell({ day, score, childId }: DayCellProps) {
  const navigate = useNavigate()
  const today = isToday(day)
  const dateStr = day.toISOString().slice(0, 10) // yyyy-MM-dd

  const hasScore = score !== undefined
  const isPositive = hasScore && score >= 0

  return (
    <button
      onClick={() => navigate(`/child/${childId}/day/${dateStr}`)}
      className={`relative flex min-h-[64px] flex-col items-end justify-start rounded-xl p-1.5
        text-right transition-all active:scale-95
        ${today ? 'ring-2 ring-indigo-500' : 'ring-1 ring-slate-200'}
        ${today ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'}`}
    >
      <span
        className={`text-xs font-medium tabular-nums ${
          today ? 'text-indigo-600' : 'text-slate-500'
        }`}
      >
        {day.getDate()}
      </span>
      {hasScore && (
        <span
          className={`mt-auto text-xs font-bold tabular-nums ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}
          {score}
        </span>
      )}
    </button>
  )
}
