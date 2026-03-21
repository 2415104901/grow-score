# Implementation Plan: 儿童积分管理系统（Family Score System）

**Branch**: `001-family-score-system` | **Date**: 2026-03-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-family-score-system/spec.md`

## Summary

构建家庭内部使用的儿童积分管理 Web 应用。技术路线：React + Vite 静态前端部署到 GitHub Pages，Supabase 提供 PostgreSQL 数据库、REST API 和行级安全（RLS）控制权限，无需独立后端服务。核心设计约束是历史记录不可变性和 child 的严格数据隔离。

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: Vite 6, TanStack Query v5, Supabase JS Client v2, Tailwind CSS v4, React Router v7  
**Storage**: Supabase（PostgreSQL 17，托管）  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web（移动端优先的响应式设计）  
**Project Type**: Web application（静态前端 + Supabase BaaS）  
**Performance Goals**: 翻月 < 1s，提交记录后刷新 < 1s（均为有网络连接状态）  
**Constraints**: 前端必须静态部署（无 Node.js 服务端），会话永不自动过期  
**Scale/Scope**: 家庭规模，~10 用户，~20 条记录/天，约 6 个页面

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Constitution: `.specify/memory/constitution.md` v1.0.0*

| 原则 | 检查项 | 状态 | 说明 |
|------|--------|------|------|
| I. MVP-First | 功能列表是否只含核心闭环（记分→查看→历史） | ✅ PASS | scope 限定：记分、日历月视图、规则管理、登录；无附加功能 |
| I. MVP-First | 是否有"未来可考虑"项被收入当前 spec | ✅ PASS | 临时规则创建明确标注 Phase 2 backlog |
| II. 扩展性 | 数据模型是否有可用扩展字段但未提前实现 | ✅ PASS | `correction_of`、`remark` 字段在 schema 中预留，组件层不使用 |
| II. 扩展性 | 是否引入了无需求驱动的抽象层 | ✅ PASS | 无 Repository Pattern / Event Bus；仅 Service 层封装 Supabase 调用 |
| III. 设计先行 | spec 中是否有未澄清的 `[NEEDS CLARIFICATION]` | ✅ PASS | 5 个澄清点全部答复，spec 无待确认标记 |
| III. 设计先行 | contracts 和 data-model 是否先于实现完成 | ✅ PASS | `supabase-schema.sql` 和 `rls-policies.sql` 已完成 |
| IV. 安全 | 密码是否使用不可逆哈希 | ✅ PASS | Supabase Auth 默认 bcrypt |
| IV. 安全 | RLS 是否在数据库层强制隔离 | ✅ PASS | `rls-policies.sql` 已覆盖全部表，child 只读自身数据 |
| IV. 安全 | records 是否无 UPDATE/DELETE Policy | ✅ PASS | `rls-policies.sql` 明确仅创建 SELECT/INSERT policy |
| IV. 安全 | 是否有密钥/Token 硬编码风险 | ✅ PASS | 所有 key 通过 `.env.local`（gitignored）注入 |
| V. 编码一致性 | TypeScript strict 模式是否启用 | ⏳ PENDING | 待 `tsconfig.json` 创建时验证 |
| V. 编码一致性 | 组件是否直接调用 Supabase Client | ⏳ PENDING | 待代码实现时在 PR 中审查 |
| UI Standards | 核心操作（记分）是否在 2 步内可达 | ✅ PASS | 日历页 FAB → 当日面板展开 = 2 步 |
| UI Standards | 移动端优先（375px）是否在设计中体现 | ✅ PASS | wireframe 基于移动端单栏布局 |

## Project Structure

### Documentation (this feature)

```text
specs/001-family-score-system/
├── plan.md              ✅ 本文件
├── research.md          ✅ Phase 0 输出
├── data-model.md        ✅ Phase 1 输出
├── quickstart.md        ✅ Phase 1 输出
├── contracts/           ✅ Phase 1 输出
│   ├── supabase-schema.sql
│   └── rls-policies.sql
└── tasks.md             ✅ Phase 2 输出（54 tasks, 8 phases）
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   └── supabase.ts          # Supabase 客户端初始化
│   ├── types/
│   │   └── index.ts             # 共享类型定义（User, Child, Rule, Record）
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChildren.ts
│   │   ├── useRules.ts
│   │   └── useRecords.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── children.ts
│   │   ├── rules.ts
│   │   └── records.ts
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── calendar/
│   │   │   ├── MonthCalendar.tsx
│   │   │   └── DayCell.tsx
│   │   ├── children/
│   │   │   ├── ChildCard.tsx
│   │   │   └── ChildForm.tsx
│   │   ├── records/
│   │   │   ├── RecordTimeline.tsx
│   │   │   └── QuickScorePanel.tsx
│   │   └── rules/
│   │       ├── RuleList.tsx
│   │       └── RuleForm.tsx
│   └── pages/
│       ├── LoginPage.tsx
│       ├── HomePage.tsx          # parent: 孩子卡片首页
│       ├── CalendarPage.tsx      # 月视图看板
│       ├── DayDetailPage.tsx     # 日详情 + 快速记分
│       ├── RulesPage.tsx
│       └── ChildrenPage.tsx
└── tests/
    ├── unit/
    └── integration/

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_rls_policies.sql
└── seed.sql                      # 仅开发环境用
```

**Structure Decision**: Web application 结构（Option 2 变体）。无独立 backend —— Supabase 充当 BaaS 层，前端直连 Supabase API。`supabase/` 目录仅存迁移文件，不运行任何服务端代码。

## Complexity Tracking

*无 Constitution 违规，无需填写。*
