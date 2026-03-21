import { supabase } from '../lib/supabase'
import type { Child, ChildWithScore } from '../types'

/**
 * 获取所有活跃孩子及其总积分
 * 对应 data-model.md 中"孩子卡片首页汇总"查询
 */
export async function fetchChildrenWithScores(): Promise<ChildWithScore[]> {
  // Supabase JS 不直接支持跨表 SUM 聚合，改用 RPC 或分两步查询
  // 方案：先查孩子，再查每个孩子的总分
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (childrenError) throw childrenError
  if (!children || children.length === 0) return []

  const { data: scores, error: scoresError } = await supabase
    .from('records')
    .select('child_id, score_snapshot')

  if (scoresError) throw scoresError

  // 按 child_id 聚合总分
  const scoreMap = new Map<string, number>()
  for (const record of scores ?? []) {
    const prev = scoreMap.get(record.child_id as string) ?? 0
    scoreMap.set(record.child_id as string, prev + (record.score_snapshot as number))
  }

  return (children as Child[]).map((child) => ({
    ...child,
    total_score: scoreMap.get(child.id) ?? 0,
  }))
}

/** 新增孩子 */
export async function createChild(name: string): Promise<Child> {
  const { data, error } = await supabase
    .from('children')
    .insert({ name, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data as Child
}

/** 软性隐藏孩子（is_active = false） */
export async function hideChild(id: string): Promise<void> {
  const { error } = await supabase
    .from('children')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}
