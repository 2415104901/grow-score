import { supabase } from '../lib/supabase'
import type { Rule } from '../types'

/** 获取所有启用中的规则，正分优先排序 */
export async function fetchActiveRules(): Promise<Rule[]> {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('is_active', true)
    .order('score', { ascending: false })

  if (error) throw error
  return (data ?? []) as Rule[]
}

/** 获取所有规则（含停用），用于规则管理页 */
export async function fetchAllRules(): Promise<Rule[]> {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .order('score', { ascending: false })

  if (error) throw error
  return (data ?? []) as Rule[]
}

/** 新增规则 */
export async function createRule(name: string, score: number): Promise<Rule> {
  if (score === 0) throw new Error('规则分值不能为 0')

  const { data, error } = await supabase
    .from('rules')
    .insert({ name, score, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data as Rule
}

/** 编辑规则名称和分值（仅影响未来记录） */
export async function updateRule(id: string, name: string, score: number): Promise<Rule> {
  if (score === 0) throw new Error('规则分值不能为 0')

  const { data, error } = await supabase
    .from('rules')
    .update({ name, score })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Rule
}

/** 切换规则启用/停用状态 */
export async function toggleRuleActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('rules')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) throw error
}

/** 删除规则（records.rule_id 将变为 null，快照数据保留） */
export async function deleteRule(id: string): Promise<void> {
  const { error } = await supabase.from('rules').delete().eq('id', id)
  if (error) throw error
}
