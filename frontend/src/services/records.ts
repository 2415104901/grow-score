import { supabase } from '../lib/supabase'
import type { DailyScore, InsertRecordInput, ScoreRecord } from '../types'
import { PermissionError } from '../types'

/**
 * 批量插入积分记录
 * 安全约束：date 不能是未来日期（Constitution IV 安全性）
 */
export async function insertRecords(records: InsertRecordInput[]): Promise<ScoreRecord[]> {
  const today = new Date().toISOString().slice(0, 10) // yyyy-MM-dd
  for (const r of records) {
    if (r.date > today) {
      throw new Error('不允许为未来日期添加记录')
    }
  }

  const { data, error } = await supabase.from('records').insert(records).select()

  if (error) {
    // RLS 拒绝（403）
    if (error.code === '42501' || error.message.includes('permission')) {
      throw new PermissionError()
    }
    throw error
  }

  return (data ?? []) as ScoreRecord[]
}

/**
 * 获取某孩子某天的全部记录（按时间升序）
 */
export async function fetchDayRecords(childId: string, date: string): Promise<ScoreRecord[]> {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('child_id', childId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ScoreRecord[]
}

/**
 * 获取某孩子某月每日净积分
 * 对应 data-model.md 中"某月每日净分"查询
 */
export async function fetchMonthlyScores(
  childId: string,
  monthStart: string,
  monthEnd: string,
): Promise<DailyScore[]> {
  const { data, error } = await supabase
    .from('records')
    .select('date, score_snapshot')
    .eq('child_id', childId)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  if (error) throw error

  // 在客户端按日期聚合 SUM（避免需要 RPC）
  const dayMap = new Map<string, number>()
  for (const row of data ?? []) {
    const d = row.date as string
    const prev = dayMap.get(d) ?? 0
    dayMap.set(d, prev + (row.score_snapshot as number))
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daily_net]) => ({ date, daily_net }))
}
