# Research: 儿童积分管理系统

**Phase**: 0 — Pre-design research  
**Date**: 2026-03-20  
**Branch**: `001-family-score-system`

---

## Decision 1: 前端框架选择

**Decision**: React 19 + Vite 6  
**Rationale**: React 的生态更广泛（组件库、日历组件、TanStack Query），Vite 提供最快的静态构建输出，GitHub Pages 部署无摩擦。项目规模（~6 页面）无需 Next.js 等 SSR 框架。  
**Alternatives considered**:
- Vue 3 + Vite：同等能力，但团队熟悉度通常低于 React，日历生态相对小。
- Next.js：引入服务端渲染不必要的复杂性，且 GitHub Pages 仅支持静态文件。

---

## Decision 2: 后端/数据层选择

**Decision**: Supabase（PostgreSQL + 自动生成 REST API + Auth + RLS）  
**Rationale**:
- 满足"无服务器（Serverless）"部署约束
- RLS（行级安全）在数据库层强制 child 数据隔离，前端无法绕过
- 支持禁用账号（Supabase Auth ban 功能）
- 多设备同步天然支持
- 提供免费额度足够家庭使用规模
- 管理员可通过 Supabase Dashboard 直接创建账号，满足"无注册"需求

**Alternatives considered**:
- Firebase：非开源，行级权限控制不如 PostgreSQL RLS 灵活，JSON 文档模型不适合关系型积分数据。
- PocketBase：自托管，需要服务器，违反 Serverless 约束。
- 纯前端本地存储：无法多设备同步，违反需求 4A。

---

## Decision 3: 认证策略

**Decision**: Supabase Auth（内置 bcrypt 哈希）+ 自定义 `profiles` 表存角色  
**Rationale**:
- Supabase Auth 处理密码哈希（bcrypt cost 10+），不存明文，满足安全要求的核心意图（规格提到 Argon2id 作推荐，bcrypt 同属现代不可逆哈希）
- 角色（parent/child）和 child_id 存在 `profiles` 表，通过 RLS 与 Supabase Auth 的 `auth.uid()` 关联
- 禁用账号：使用 Supabase Admin API 的 `ban_duration` 或直接在 Dashboard 禁用用户，使刷新令牌立即失效

**关于 Argon2id vs bcrypt**:
- Supabase Auth 内部使用 bcrypt，无法替换为 Argon2id
- bcrypt 对于家庭应用场景（非高并发攻击目标）足够安全
- 如需 Argon2id，需部署自定义 Edge Function 实现独立认证端点，复杂度过高，不值得

**Alternatives considered**:
- 自定义 JWT + Argon2id：需要 Edge Function 或独立服务，违反纯静态前端约束。
- Magic link / 无密码：增加复杂度，且需要邮箱，与"家庭内部简单场景"不符。

---

## Decision 4: 会话永不过期实现

**Decision**: Supabase Client 默认 `persistSession: true` + 设 refresh token 有效期为 10 年  
**Rationale**:
- Supabase 的 refresh token 默认 1 周，可在 Dashboard → Authentication → Settings 调整到最长（无限期或 3650 天）
- 前端 `supabase.auth.onAuthStateChange` 自动处理 access token 刷新，用户无感知
- 账号停用时，Supabase 的 Ban 功能会撤销所有活跃 refresh token，立即强制下线

**Alternatives considered**:
- 每次使用都续期：行为符合，但 Supabase 已默认实现。
- 纯 localStorage 存储 token 自行管理：不必要，Supabase client 已处理。

---

## Decision 5: 不可变记录策略

**Decision**: PostgreSQL RLS Policy 禁用 UPDATE 和 DELETE，配合应用层约束  
**Rationale**:
- RLS 层在数据库强制，即使直接调用 Supabase API 也无法绕过
- `INSERT` 仅允许 parent 角色（通过 profiles 表 join）
- 应用层额外检查防止前端误操作，但数据库是最后一道防线

```sql
-- records 表 RLS 策略核心
CREATE POLICY "records_insert_parent_only" ON records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'parent')
  );

-- 禁用 UPDATE 和 DELETE（不创建对应 policy 即等于禁用）
```

**Alternatives considered**:
- 应用层软删除标记：仍允许 UPDATE，不满足"不可变"要求。
- 数据库触发器：比 RLS 更复杂，且 Supabase 已通过不创建 policy 来隐式禁止。

---

## Decision 6: 总分计算方式

**Decision**: 实时聚合查询（`SUM(score_snapshot)`），不做物化缓存  
**Rationale**:
- 家庭规模（每天 5-20 条，全年上限约 7000 条），PostgreSQL 聚合查询极快
- 无需维护物化视图或触发器，数据始终一致
- TanStack Query 做客户端缓存，避免重复请求

**Alternatives considered**:
- 维护 `total_score` 字段在 `children` 表：需要触发器保持同步，违反"极简实现"原则且引入一致性风险。
- 前端累加历史：需要拉取全部记录，流量浪费。

---

## Decision 7: 月视图数据获取

**Decision**: 按月查询该孩子的所有记录，前端聚合为"日级净分"  
**Rationale**:
- `WHERE child_id = ? AND date >= month_start AND date <= month_end`
- 前端按 date 分组计算每日净分（`sum of score_snapshot`）
- 一次请求获取整月数据，翻月时重新请求，配合 TanStack Query 的 staleTime 缓存

**Alternatives considered**:
- 按天查询（30 次请求）：性能差。
- 后端聚合 API（Edge Function）：引入额外复杂度，家庭规模不需要。

---

## Decision 8: 日历组件

**Decision**: 自行实现月历渲染（无第三方日历库）  
**Rationale**:
- 需求简单（月格子 + 净分展示 + 翻月），现有库（react-calendar, react-big-calendar）功能过重
- 自实现约 100 行，完全控制样式和交互
- 使用 `date-fns` 做日期计算（轻量、Tree-shakeable）

**Alternatives considered**:
- react-calendar：可用但样式定制成本高
- date-fns/startOfMonth + 手动渲染：选用方案

---

## Resolved Unknowns

| 原 Unknown | 解决方案 |
|---|---|
| 前端框架 | React 19 + Vite 6 |
| 认证实现 | Supabase Auth + profiles 表 |
| 会话永不过期 | Supabase refresh token 延长至 10 年 |
| 密码哈希 | Supabase Auth 内置 bcrypt（接受，不做 Argon2id 自定义） |
| 总分计算 | 实时 SUM 聚合查询 |
| 历史不可变 | RLS 不创建 UPDATE/DELETE policy |
| 日历组件 | 自实现 + date-fns |
| 账号禁用生效 | Supabase Ban → 立即撤销 refresh token |
