import type { ChildWithScore } from '../../types'

interface ChildCardProps {
  child: ChildWithScore
  onClick: () => void
}

const CARD_GRADIENTS = [
  'linear-gradient(145deg, #fef3c7, #fde68a)',
  'linear-gradient(145deg, #dcfce7, #bbf7d0)',
  'linear-gradient(145deg, #dbeafe, #bfdbfe)',
  'linear-gradient(145deg, #fce7f3, #fbcfe8)',
  'linear-gradient(145deg, #ede9fe, #ddd6fe)',
]

function getGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
}

export default function ChildCard({ child, onClick }: ChildCardProps) {
  const isPositive = child.total_score >= 0
  const gradient = getGradient(child.name)

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl p-5 text-left
        transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:shadow-lg"
      style={{
        background: gradient,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Avatar circle */}
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white"
        style={{
          background: isPositive
            ? 'linear-gradient(135deg, #34d399, #16a34a)'
            : 'linear-gradient(135deg, #f87171, #dc2626)',
          boxShadow: isPositive
            ? '0 4px 12px rgba(34,197,94,0.4)'
            : '0 4px 12px rgba(220,38,38,0.35)',
        }}
      >
        {child.name.charAt(0)}
      </div>

      {/* Name */}
      <span className="text-base font-black text-[#1c1917]">{child.name}</span>

      {/* Score */}
      <div className="flex items-end gap-1">
        <span
          className="text-4xl font-black tabular-nums leading-none"
          style={{ color: isPositive ? '#15803d' : '#dc2626' }}
        >
          {isPositive ? '+' : ''}
          {child.total_score}
        </span>
        <span className="mb-1 text-xs font-bold text-[#a09278]">分</span>
      </div>

      {/* Decorative circle */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full"
        style={{ background: 'rgba(255,255,255,0.5)' }}
      />
    </button>
  )
}
