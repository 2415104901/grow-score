import { useNavigate } from 'react-router-dom'
import { useChildren } from '../hooks/useChildren'
import ChildCard from '../components/children/ChildCard'

export default function HomePage() {
  const navigate = useNavigate()
  const { data: children, isLoading, error } = useChildren()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-red-500">加载失败，请刷新页面重试</p>
      </div>
    )
  }

  if (!children || children.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-slate-400">暂无孩子档案，请先到"孩子管理"添加孩子</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-5">
        <h2 className="text-xl font-black text-[#1c1917]">选择孩子</h2>
        <p className="mt-0.5 text-sm font-semibold text-[#b89c6e]">点击查看积分记录 ✨</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {children.map((child) => (
          <div key={child.id} className="w-[calc(50%-6px)] min-w-[140px]">
            <ChildCard
              child={child}
              onClick={() => navigate(`/child/${child.id}/calendar`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
