// ============================================================
// 共享类型定义
// 对应数据模型：specs/001-family-score-system/data-model.md
// ============================================================

export type UserRole = 'parent' | 'child'

/** profiles 表 — 扩展 Supabase Auth 用户，存储角色和绑定孩子 */
export interface Profile {
  id: string
  user_id: string
  role: UserRole
  /** child 角色必填，parent 为 null */
  child_id: string | null
  display_name: string
  created_at: string
  updated_at: string
}

/** children 表 — 孩子档案 */
export interface Child {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** children 表 + 聚合总分 — 用于首页孩子卡片 */
export interface ChildWithScore extends Child {
  total_score: number
}

/** rules 表 — 积分规则 */
export interface Rule {
  id: string
  name: string
  /** 非零整数，正数为加分，负数为扣分 */
  score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** records 表 — 不可变积分事件 */
export interface ScoreRecord {
  id: string
  child_id: string
  /** 关联规则 ID，规则被删除后可为 null（快照已冗余） */
  rule_id: string | null
  /** 记录时的规则名称快照 */
  rule_name_snapshot: string
  /** 记录时的分值快照 */
  score_snapshot: number
  /** 积分所属日期（本地日期，格式 yyyy-MM-dd） */
  date: string
  /** 操作人（parent 账号的 auth.users.id） */
  created_by: string
  created_at: string
  /** 预留：冲正时指向原记录，第一阶段不由 UI 填充 */
  correction_of: string | null
}

/** 月度每日积分聚合 — 用于月视图看板 */
export interface DailyScore {
  date: string
  daily_net: number
}

/** 新增记录的输入参数 */
export interface InsertRecordInput {
  child_id: string
  rule_id: string
  rule_name_snapshot: string
  score_snapshot: number
  date: string
  created_by: string
}

/** 权限错误 — 用于区分 RLS 拒绝和其他错误 */
export class PermissionError extends Error {
  constructor(message = '权限不足，无法执行此操作') {
    super(message)
    this.name = 'PermissionError'
  }
}
