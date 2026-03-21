# Data Model: 儿童积分管理系统

**Phase**: 1 — Design  
**Date**: 2026-03-20  
**Branch**: `001-family-score-system`

---

## Entity Overview

```
auth.users (Supabase Auth)
     │
     │ 1:1
     ▼
profiles ──────────── children (1:1, child role only)
                          │
                          │ 1:N
                          ▼
rules ────────────── records
(独立，不关联 child)   child_id + rule_id(nullable)
                       rule_name_snapshot
                       score_snapshot
```

---

## Entities

### profiles

扩展 Supabase Auth 用户，存储角色和绑定孩子。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK | 与 `auth.users.id` 相同 |
| `user_id` | `uuid` FK → auth.users | Supabase Auth 用户 ID |
| `role` | `text` CHECK IN ('parent','child') | 用户角色 |
| `child_id` | `uuid` FK → children (nullable) | child 角色必填，parent 为 null |
| `display_name` | `text` | 展示名 |
| `created_at` | `timestamptz` | 创建时间（UTC） |
| `updated_at` | `timestamptz` | 更新时间（UTC） |

**约束**:
- `role = 'child'` 时 `child_id` 必填
- `role = 'parent'` 时 `child_id` 为 null

---

### children

孩子档案，拥有独立积分空间。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK DEFAULT gen_random_uuid() | 孩子唯一 ID |
| `name` | `text` NOT NULL | 孩子姓名 |
| `is_active` | `boolean` DEFAULT true | false = 软删除/隐藏 |
| `created_at` | `timestamptz` DEFAULT now() | 创建时间（UTC） |
| `updated_at` | `timestamptz` DEFAULT now() | 更新时间（UTC） |

**业务规则**:
- `is_active = false` 时不显示在孩子列表中
- 停用孩子不删除其历史 records
- 总分通过 `records` 表聚合计算，不存本字段

---

### rules

积分规则，分值固定，修改不回溯历史。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK DEFAULT gen_random_uuid() | 规则唯一 ID |
| `name` | `text` NOT NULL | 规则名称 |
| `score` | `integer` NOT NULL | 分值（正/负，非零） |
| `is_active` | `boolean` DEFAULT true | false = 停用，不可用于新记录 |
| `created_at` | `timestamptz` DEFAULT now() | 创建时间（UTC） |
| `updated_at` | `timestamptz` DEFAULT now() | 更新时间（UTC） |

**业务规则**:
- `score` 不得为 0
- `is_active = false` 的规则不出现在记分面板的可选列表中
- 规则修改（name/score）只影响未来记录，历史记录已冗余快照
- 第一阶段所有规则均等价（无"默认/自定义"区分）

---

### records（不可变事件）

积分记录，每条规则一条记录，入库后不可修改或删除。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `uuid` PK DEFAULT gen_random_uuid() | 记录唯一 ID |
| `child_id` | `uuid` NOT NULL FK → children | 关联孩子 |
| `rule_id` | `uuid` nullable FK → rules | 关联规则（预留，快照删除后可为空） |
| `rule_name_snapshot` | `text` NOT NULL | 规则名称快照（记录时冗余） |
| `score_snapshot` | `integer` NOT NULL | 分值快照（记录时冗余）|
| `date` | `date` NOT NULL | 积分所属日期（本地日期，前端传入） |
| `created_by` | `uuid` NOT NULL FK → auth.users | 操作人（parent 账号） |
| `created_at` | `timestamptz` DEFAULT now() | 服务端写入时间（UTC） |
| `correction_of` | `uuid` nullable FK → records | 预留：冲正时指向原记录（第一阶段不由 UI 填充） |

**不可变性保障**:
- RLS Policy 仅创建 SELECT 和 INSERT，不创建 UPDATE 和 DELETE Policy
- 即使通过 Supabase 直接 API 调用，UPDATE/DELETE 也会返回 403

**业务规则**:
- `date` 不允许为未来日期（由应用层校验，`date <= CURRENT_DATE`）
- 一次提交多条规则 → 写入多条 records，每条独立

---

## 积分计算

### 孩子总分

```sql
SELECT COALESCE(SUM(score_snapshot), 0) AS total_score
FROM records
WHERE child_id = :child_id;
```

### 某月每日净分

```sql
SELECT date, SUM(score_snapshot) AS daily_net
FROM records
WHERE child_id = :child_id
  AND date >= :month_start
  AND date <= :month_end
GROUP BY date
ORDER BY date;
```

### 孩子卡片首页汇总

```sql
SELECT
  c.id,
  c.name,
  COALESCE(SUM(r.score_snapshot), 0) AS total_score
FROM children c
LEFT JOIN records r ON r.child_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;
```

---

## 状态转换图

### Rule 生命周期

```
新建 (is_active=true)
       │
       │ 家长停用
       ▼
停用 (is_active=false)  ────► 不出现在记分面板
       │
       │ 家长重新启用
       ▼
启用 (is_active=true)
       │
       │ 家长删除
       ▼
删除 (物理删除，历史 records.rule_id 设为 null，快照保留)
```

### Child 生命周期

```
活跃 (is_active=true)  ────► 显示在孩子列表 / 记分选择
       │
       │ 家长隐藏
       ▼
隐藏 (is_active=false) ────► 不显示，但历史记录保留
```

### Record 生命周期

```
提交 (INSERT) ────► 永久只读
                      │
                      │ 纠错时
                      ▼
                  新增反向记录 (INSERT，score 为相反值)
```

---

## 索引建议

```sql
-- 最高频查询：按孩子 + 日期范围查记录
CREATE INDEX idx_records_child_date ON records (child_id, date);

-- 访问控制：快速查 profiles
CREATE INDEX idx_profiles_user_id ON profiles (user_id);

-- 孩子卡片首页：聚合查询优化
CREATE INDEX idx_records_child_id ON records (child_id);
```

---

## 字段验证规则

| 实体 | 字段 | 约束 |
|------|------|------|
| rules | score | INTEGER，≠ 0 |
| records | date | ≤ CURRENT_DATE（应用层 + DB CHECK） |
| records | score_snapshot | 来源于 rules.score，不接受客户端自定义 |
| children | name | 非空字符串，trim 后长度 ≥ 1 |
| profiles | role | 仅允许 'parent' 或 'child' |
