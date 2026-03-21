import { format } from 'date-fns'
import type { ScoreRecord } from '../../types'

interface RecordTimelineProps {
  records: ScoreRecord[]
}

export default function RecordTimeline({ records }: RecordTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-slate-400">今日暂无记录</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => {
        const isPositive = record.score_snapshot >= 0
        const timeStr = format(new Date(record.created_at), 'HH:mm')
        return (
          <div
            key={record.id}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm
              ring-1 ring-slate-200"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-800">
                {record.rule_name_snapshot}
              </span>
              <span className="text-xs text-slate-400">{timeStr}</span>
            </div>
            <span
              className={`text-base font-bold tabular-nums ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? '+' : ''}
              {record.score_snapshot}
            </span>
          </div>
        )
      })}
    </div>
  )
}
