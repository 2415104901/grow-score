# 任务清单：儿童积分管理系统（Family Score System）

**输入文档**：`/specs/001-family-score-system/`
**功能分支**：`001-family-score-system`
**日期**：2026-03-20
**前置文档**：plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅、contracts/ ✅、quickstart.md ✅

**测试**：spec 中未明确要求测试任务，本清单不生成测试任务。开发种子数据在收尾阶段提供，供手动验证使用。

**组织原则**：任务按用户故事分组，支持每个故事独立实现和验证。US1 包含认证 + 孩子选择 + 规则选择 + 记录提交完整闭环，因为 spec.md 明确将其定义为 US1 独立可测范围。

## 格式说明：`[任务ID] [P?] [故事标签] 描述`

- **[P]**：可并行执行（操作不同文件，不依赖未完成的任务）
- **[故事标签]**：[US1]–[US5]，对应用户故事；基础设施任务不带故事标签
- 所有路径相对于仓库根目录

---

## 第一阶段：初始化（共享基础设施）

**目的**：按照 plan.md 初始化 Vite + React + TypeScript 工程脚手架

- [X] T001 在 `frontend/` 目录初始化 Vite 6 + React 19 + TypeScript 工程 — 执行 `npm create vite@latest frontend -- --template react-ts`，删除样板文件（`App.css`、`assets/react.svg`）
- [X] T002 在 `frontend/` 安装所有 npm 依赖 — 生产依赖：`@supabase/supabase-js @tanstack/react-query react-router-dom date-fns`；开发依赖：`@typescript-eslint/eslint-plugin @typescript-eslint/parser eslint`
- [X] T003 [P] 在 `frontend/tsconfig.json` 配置 TypeScript 严格模式 — 设置 `"strict": true`、`"noUnusedLocals": true`、`"noUnusedParameters": true`、`"noImplicitReturns": true`
- [X] T004 [P] 在 `frontend/tailwind.config.ts` 配置 Tailwind CSS v4，并在 `frontend/src/index.css` 顶部添加 `@import "tailwindcss"` 指令；删除 Vite 默认 CSS 样式
- [X] T005 [P] 在 `frontend/eslint.config.ts` 配置 TypeScript ESLint 规则 — 将 `@typescript-eslint/no-explicit-any` 和 `@typescript-eslint/no-unused-vars` 设置为 error 级别

**检查点**：`npm run dev` 成功启动开发服务器；`npm run build` 编译通过；`npm run lint` 零报错

---

## 第二阶段：基础层（阻塞性前提条件）

**目的**：数据库迁移、Supabase 客户端、全局 TypeScript 类型定义、应用路由骨架。所有用户故事阶段均依赖本阶段。

**⚠️ 关键**：本阶段未完成前，任何用户故事均不得开始实现

- [X] T006 将 `specs/001-family-score-system/contracts/supabase-schema.sql` 内容复制到 `supabase/migrations/001_initial_schema.sql`，并在 Supabase Dashboard → SQL Editor 中执行，创建全部 4 张数据表和相关索引
- [X] T007 将 `specs/001-family-score-system/contracts/rls-policies.sql` 内容复制到 `supabase/migrations/002_rls_policies.sql`，并在 Supabase Dashboard → SQL Editor 中执行，启用 RLS 并创建全部行级安全策略
- [X] T008 [P] 创建 `frontend/.env.local.example`，填入占位变量 `VITE_SUPABASE_URL=` 和 `VITE_SUPABASE_ANON_KEY=`；创建 `frontend/.gitignore`，排除 `.env.local`、`node_modules/`、`dist/`、`.DS_Store`
- [X] T009 [P] 在 `frontend/src/lib/supabase.ts` 创建 Supabase 客户端单例 — `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: true } })`
- [X] T010 [P] 在 `frontend/src/types/index.ts` 定义所有共享 TypeScript 接口：`Profile`（id、user_id、role、child_id、display_name）、`Child`（id、name、is_active）、`Rule`（id、name、score、is_active）、`Record`（id、child_id、rule_id、rule_name_snapshot、score_snapshot、date、created_by、created_at、correction_of）、`UserRole`（'parent' | 'child'）、`DailyScore`（date: string、daily_net: number）、`ChildWithScore`（继承 Child 并增加 total_score）
- [X] T011 在 `frontend/src/main.tsx` 创建 TanStack QueryClient Provider 和 React Router v7 路由器；在 `frontend/src/App.tsx` 搭建全部页面路由骨架（占位组件）— 路由：`/login`、`/home`、`/child/:childId/calendar`、`/child/:childId/day/:date`、`/rules`、`/children`

**检查点**：Supabase 数据表和 RLS 策略在 Dashboard 中验证通过；TypeScript 类型编译通过；应用骨架在浏览器中加载并显示占位页面

---

## 第三阶段：用户故事 1 - 家长为孩子快速记分（优先级：P1）🎯 MVP

**目标**：家长能够登录、从首页选择孩子、进入日详情页、勾选一条或多条规则后提交不可变积分记录——完整的核心记分闭环。

**独立验证**：以 parent 账号登录 → 首页显示孩子卡片及总分 → 点击孩子卡片 → 进入 DayDetailPage → 展开 QuickScorePanel → 勾选两条规则 → 提交 → 数据库中生成两条记录，`rule_name_snapshot` 和 `score_snapshot` 正确；ChildCard 上的总分相应增加。

### 用户故事 1 实现任务

**认证——US1 记分闭环的必要前提**

- [X] T012 [US1] 在 `frontend/src/services/auth.ts` 实现认证服务：导出 `signIn(email: string, password: string)`、`signOut()`、`getSession()`、`onAuthStateChange(callback)` — 对 Supabase Auth 客户端的薄封装；不得将 Supabase 原始错误对象暴露给调用方
- [X] T013 [US1] 在 `frontend/src/hooks/useAuth.ts` 实现 `useAuth` Hook：订阅 `supabase.auth.onAuthStateChange`，在会话变化时获取当前用户的 `profiles` 行，对外暴露 `{ session, profile, role: UserRole | null, childId: string | null, isLoading }`
- [X] T014 [P] [US1] 在 `frontend/src/components/auth/LoginForm.tsx` 构建 `LoginForm` 组件：受控的邮箱 + 密码输入框、带加载动画的提交按钮、错误信息插槽（string prop）；加载期间禁用表单提交
- [X] T015 [P] [US1] 在 `frontend/src/pages/LoginPage.tsx` 构建 `LoginPage`：渲染 `LoginForm`，调用 `auth.signIn`，登录成功后导航到 `/`（角色路由跳转在 App 路由层处理）
- [X] T016 [US1] 在 `frontend/src/components/auth/AuthGuard.tsx` 实现 `AuthGuard` 包裹组件：从 `useAuth` 读取会话；已认证则渲染子组件，未认证则跳转到 `/login`；`isLoading` 为 true 时显示加载态；在 `frontend/src/App.tsx` 中将 `AuthGuard` 包裹所有业务路由

**孩子数据——US1 孩子选择器所需的读取权限**

- [X] T017 [US1] 在 `frontend/src/services/children.ts` 实现孩子服务：导出 `fetchChildrenWithScores()` — Supabase 查询，将 `children` 与 `records.score_snapshot` 按孩子分组聚合 SUM；返回 `is_active = true` 的 `ChildWithScore[]`，按姓名排序
- [X] T018 [US1] 在 `frontend/src/hooks/useChildren.ts` 实现 `useChildren` Hook：用 `useQuery({ queryKey: ['children'] })` 封装 `fetchChildrenWithScores`

**规则数据——US1 记分面板所需的读取权限**

- [X] T019 [US1] 在 `frontend/src/services/rules.ts` 实现规则服务：导出 `fetchActiveRules()` — 查询 `is_active = true` 的规则，按 `score DESC` 排序（正分规则优先展示）
- [X] T020 [US1] 在 `frontend/src/hooks/useRules.ts` 实现 `useRules` Hook：用 `useQuery({ queryKey: ['rules'] })` 封装 `fetchActiveRules`

**记录数据——US1 的核心写入路径**

- [X] T021 [US1] 在 `frontend/src/services/records.ts` 实现记录服务：导出 `insertRecords(records: Array<{ child_id, rule_id, rule_name_snapshot, score_snapshot, date, created_by }>)` — 单次 Supabase `insert` 调用传入数组；导出 `fetchDayRecords(childId: string, date: string)` — 按孩子和日期查询记录，按 `created_at ASC` 排序
- [X] T022 [US1] 在 `frontend/src/hooks/useRecords.ts` 实现 `useRecords` Hook：导出 `useDayRecords(childId, date)` 使用 `useQuery`；导出 `useInsertRecords()` 使用 `useMutation`，成功后使 `['day-records', childId, date]` 和 `['children']` 查询缓存失效（刷新总分）

**用户故事 1 UI 组件**

- [X] T023 [P] [US1] 在 `frontend/src/components/children/ChildCard.tsx` 构建 `ChildCard` 组件：展示孩子 `name` 和 `total_score`（≥ 0 显示绿色、< 0 显示红色），整张卡片可点击；接收 `onClick` prop 用于导航
- [X] T024 [P] [US1] 在 `frontend/src/components/records/QuickScorePanel.tsx` 构建 `QuickScorePanel` 组件：分"加分规则"和"扣分规则"两个区块，每条规则为复选框行显示 `name` 和 `score`；实时显示已勾选规则的分值合计预览；提交按钮（勾选 ≥ 1 条时启用）和取消按钮；分值必须来源于规则定义——不提供分值输入框
- [X] T025 [US1] 在 `frontend/src/pages/HomePage.tsx` 构建 `HomePage`：仅 parent 可见；通过 `useChildren` 获取孩子数据；以两列网格渲染 `ChildCard`（移动端）；点击卡片导航到 `/child/:childId/calendar`
- [X] T026 [US1] 在 `frontend/src/pages/DayDetailPage.tsx` 构建 `DayDetailPage`：从路由参数读取 `childId` 和 `date`；显示日期标题和当日净分；渲染只读当日记录列表（显示 rule_name_snapshot、带颜色的 score_snapshot、来自 created_at 的时间）；仅 parent 角色显示"＋ 新增记录"按钮，点击展开 `QuickScorePanel`；提交时调用 `useInsertRecords` mutation，传入所选规则的正确快照数据

**检查点**：家长完成完整记分闭环。Supabase `records` 表中存在正确的 `rule_name_snapshot` 和 `score_snapshot`。ChildCard 上的总分反映所有记录。

---

## 第四阶段：用户故事 2 - 家长和孩子查看月视图看板（优先级：P1）

**目标**：月历网格展示每日积分净值（带颜色语义），支持上月/下月翻页，提供 FAB 快速记分，child 账号直接进入自己的月视图。

**独立验证**：数据库中有记录的情况下，打开 CalendarPage → 有记录的日期正确显示绿色/红色净分 → 点击"上月" → 上月数据在 1 秒内加载完成 → 点击某个日格子 → DayDetailPage 显示正确记录 → FAB 导航到今日并自动展开记分面板。

### 用户故事 2 实现任务

- [X] T027 [US2] 在 `frontend/src/services/records.ts` 扩展记录服务：新增 `fetchMonthlyScores(childId: string, monthStart: string, monthEnd: string)` — 通过 Supabase 查询构建器执行月度聚合查询；返回 `DailyScore[]`
- [X] T028 [US2] 在 `frontend/src/hooks/useRecords.ts` 扩展 Hook：新增 `useMonthlyScores(childId, year, month)` 使用 `useQuery({ queryKey: ['monthly-scores', childId, year, month] })`；用 date-fns 的 `startOfMonth` / `endOfMonth` 计算日期范围，格式化为 ISO 字符串（`yyyy-MM-dd`）
- [X] T029 [P] [US2] 在 `frontend/src/components/calendar/DayCell.tsx` 构建 `DayCell` 组件：props — `day: Date`、`score?: number`、`isToday: boolean`；右上角渲染日期数字；`score` 有值时显示格式化分值（如"+5"/"−2"）及对应颜色文字；`isToday` 为 true 时高亮单元格边框；点击导航到对应日期的 DayDetailPage
- [X] T030 [P] [US2] 在 `frontend/src/components/calendar/MonthCalendar.tsx` 构建 `MonthCalendar` 组件：接收 `year`、`month`、`scores: DailyScore[]`、`childId`；用 date-fns `eachDayOfInterval(startOfMonth, endOfMonth)` 生成 7 列周网格；将 `DailyScore[]` 按日期字符串映射到各 `DayCell`；补齐首行的前置空格
- [X] T031 [US2] 在 `frontend/src/pages/CalendarPage.tsx` 构建 `CalendarPage`：从路由参数读取 `childId`；维护 `year`/`month` 状态（默认当月）；通过 `useMonthlyScores` 获取月度积分；渲染：孩子姓名 + 总分标题、年月标签与 `[<]`/`[>]` 翻页按钮、`MonthCalendar`、右下角 FAB"＋ 记分"按钮（仅 parent 可见），点击后导航到 `/child/:childId/day/:todayISO?autoOpen=true`
- [X] T032 [P] [US2] 在 `frontend/src/components/records/RecordTimeline.tsx` 构建 `RecordTimeline` 组件：只读列表展示 `Record[]`；每行左侧显示 `rule_name_snapshot`，右侧显示带语义颜色的 `score_snapshot`，下方显示格式化时间（HH:mm）；空状态文案"今日暂无记录"
- [X] T033 [US2] 将 `RecordTimeline` 集成到 `frontend/src/pages/DayDetailPage.tsx`：在记分面板上方添加 `RecordTimeline` 区块；通过 `useSearchParams` 读取 `autoOpen` 参数，作为 `defaultOpen` prop 传入 `QuickScorePanel`——实现 FAB 一步展开面板
- [X] T034 [US2] 在 `frontend/src/App.tsx` 实现基于角色的首页跳转：认证后若 `role === 'child'` 则将 `/` 和 `/home` 重定向到 `/child/:profile.child_id/calendar`；若 `role === 'parent'` 则重定向到 `/home`；通过 loader 或组件层 `useEffect` 实现

**检查点**：月历正确渲染。翻月切换正常。child 登录后跳过首页直接进入自己的月视图。FAB 自动展开记分面板。

---

## 第五阶段：用户故事 3 - 家长管理规则（优先级：P2）

**目标**：家长可以在规则管理页新增规则、编辑规则名称/分值、切换启用/停用状态、删除规则。

**独立验证**：打开 RulesPage → 新建规则"游泳练习"（+4）→ 出现在列表中 → 编辑分值为 +5 → 标记为停用 → 打开 QuickScorePanel——该规则不在列表中 → 重新启用 → 规则重新出现在 QuickScorePanel 中。

### 用户故事 3 实现任务

- [X] T035 [US3] 在 `frontend/src/services/rules.ts` 扩展规则服务：新增 `createRule(name: string, score: number)`（校验 score ≠ 0）、`updateRule(id: string, name: string, score: number)`（校验 score ≠ 0）、`toggleRuleActive(id: string, isActive: boolean)`、`deleteRule(id: string)` — 每个操作返回更新后的行或抛出类型化错误
- [X] T036 [P] [US3] 在 `frontend/src/components/rules/RuleForm.tsx` 构建 `RuleForm` 组件：受控的 `name`（必填）和 `score`（数字，非零——为 0 时显示行内校验错误）输入框；保存/取消按钮；用于创建（无初始值）和编辑（预填充值）两种场景
- [X] T037 [P] [US3] 在 `frontend/src/components/rules/RuleList.tsx` 构建 `RuleList` 组件：将规则分为"加分规则"（score > 0）和"扣分规则"（score < 0）两组；每行显示：规则名、分值标签、编辑图标按钮、启用/停用切换按钮、删除按钮；停用的规则行以灰化样式显示
- [X] T038 [US3] 在 `frontend/src/pages/RulesPage.tsx` 构建 `RulesPage`：仅 parent 可见；通过 `useQuery` 获取所有规则（含停用）；渲染 `RuleList`；点击"新增规则"按钮以内联下拉或底部抽屉方式打开 `RuleForm`；通过 mutation 处理编辑和删除
- [X] T039 [US3] 在 `frontend/src/hooks/useRules.ts` 扩展 Hook：新增 `useCreateRule`、`useUpdateRule`、`useToggleRule`、`useDeleteRule` mutations；每个调用对应的 service 函数，成功后使 `['rules']` 查询缓存失效，同时刷新 RulesPage 和 QuickScorePanel

**检查点**：规则 CRUD 全部正常。停用后的规则不出现在 QuickScorePanel 中。编辑规则分值后，历史记录的 `score_snapshot` 值不变——通过查看 DayDetailPage 中的历史记录验证。

---

## 第六阶段：用户故事 4 - 登录与访问控制（优先级：P2）

**目标**：完善认证错误提示（账号锁定和停用均显示中文提示）；child 角色看不到任何写入 UI，且在路由层被阻止访问 parent 专属页面。

**独立验证**：连续输错密码 5 次 → 显示中文锁定提示；使用停用账号登录 → 显示停用提示；以 child 登录 → 看不到"＋ 新增记录"按钮；以 child 访问 `/rules` → 跳回自己的 CalendarPage。

### 用户故事 4 实现任务

- [X] T040 [US4] 完善 `frontend/src/pages/LoginPage.tsx` 中的错误处理：解析 `auth.signIn` 返回的 `AuthApiError`，映射错误码 — 普通认证失败 → "账号或密码错误"、HTTP 429 / 频率限制 → "登录失败次数过多，请稍后重试"、账号禁用 → "账号已停用，请联系管理员"；不得将 Supabase 原始错误信息直接展示给用户
- [X] T041 [US4] 在 `frontend/src/pages/DayDetailPage.tsx` 强制执行 parent 专属写入 UI：仅当 `useAuth().role === 'parent'` 时渲染"＋ 新增记录"按钮和 `QuickScorePanel`；child 角色只看到 `RecordTimeline`，无任何操作按钮
- [X] T042 [P] [US4] 在 `frontend/src/components/auth/ParentOnlyGuard.tsx` 添加 `ParentOnlyGuard` 包裹组件：从 `useAuth` 读取 `role`；如果 `role === 'child'` 则跳转到 `/child/:childId/calendar`；在 `frontend/src/App.tsx` 中用该组件包裹 `/home`、`/rules`、`/children` 路由
- [X] T043 [US4] 在 `frontend/src/services/records.ts` 验证 RLS 强制执行：在 `insertRecords` 中检查 Supabase 响应 — 若返回 `403` 或权限错误，抛出类型化 `PermissionError`；调用方组件将其渲染为"权限不足，无法写入数据"，而不是静默失败或显示原始错误字符串

**检查点**：child 账号：写入 UI 已隐藏、parent 专属路由已重定向、直接 API 插入返回 403。所有认证错误提示均为清晰的中文，未暴露 Supabase 内部错误信息。

---

## 第七阶段：用户故事 5 - 家长管理孩子档案（优先级：P3）

**目标**：家长可通过孩子管理页新增孩子、软性隐藏孩子；被隐藏孩子的历史记录完整保留。

**独立验证**：打开 ChildrenPage → 新增孩子"小明" → 出现在 ChildrenPage 列表和首页 ChildCard 网格（总分为 0）→ 隐藏"小明" → 两处均消失 → Supabase `records` 表中该孩子的历史记录仍然存在。

### 用户故事 5 实现任务

- [X] T044 [US5] 在 `frontend/src/services/children.ts` 扩展孩子服务：新增 `createChild(name: string)` — 向 `children` 表插入 `is_active = true` 的行；新增 `hideChild(id: string)` — 将指定孩子的 `is_active` 更新为 false；两者均返回更新后或插入后的行
- [X] T045 [US5] 在 `frontend/src/hooks/useChildren.ts` 扩展 Hook：新增 `useCreateChild` mutation（成功后使 `['children']` 缓存失效）和 `useHideChild` mutation（成功后使 `['children']` 缓存失效）
- [X] T046 [P] [US5] 在 `frontend/src/components/children/ChildForm.tsx` 构建 `ChildForm` 组件：单个必填 `name` 文本输入框，保存按钮（name 为空时禁用）和取消按钮；`onSubmit(name: string)` prop 在保存时调用
- [X] T047 [US5] 在 `frontend/src/pages/ChildrenPage.tsx` 构建 `ChildrenPage`：仅 parent 可见；通过 `useChildren` 获取活跃孩子列表；渲染列表，每行显示孩子姓名、总分、"隐藏"按钮（点击前弹出确认对话框，确认后调用 `useHideChild`）；点击"新增孩子"按钮以内联方式打开 `ChildForm`；新增成功后调用 `useCreateChild` mutation

**检查点**：新增孩子立即显示在首页和月视图路由中。被隐藏的孩子不出现在任何活跃列表中。在 Supabase Dashboard 中可直接查询到该孩子的历史记录。

---

## 第八阶段：收尾与跨功能优化

**目的**：部署配置、导航外壳、全故事 UX 一致性检查，以及最终端到端验证

- [X] T048 [P] 在 `frontend/vite.config.ts` 配置 GitHub Pages 部署：设置 `base` 为仓库路径（如 `'/grow-score/'`）、`build.outDir: '../dist'`、`build.emptyOutDir: true`；在 `frontend/package.json` 添加 `build` 和 `preview` 脚本
- [X] T049 在 `frontend/src/components/layout/AppLayout.tsx` 构建 `AppLayout` 组件：顶部导航栏显示应用名"积分管理"；parent 专属导航链接"规则管理"（`/rules`）和"孩子管理"（`/children`）；右上角登出图标按钮；在 `frontend/src/App.tsx` 中用 `AppLayout` 包裹所有已认证页面路由
- [X] T050 在 `frontend/src/components/layout/AppLayout.tsx` 实现登出操作：调用 `auth.signOut()`，然后 `queryClient.clear()` 清除所有缓存数据，最后导航到 `/login`
- [X] T051 [P] 创建开发环境种子文件 `supabase/seed.sql`：插入 1 个关联 Supabase Auth 测试用户的 parent profile、1 个孩子"小明"、3 条规则（"按时完成作业" +2、"主动帮忙家务" +3、"玩手机超时" -2）、分布在 3 个日期的 5 条记录——仅用于本地测试，不可在生产环境执行
- [ ] T052 [P] 响应式适配检查：在 Chrome DevTools 以 375 × 812 视口尺寸逐页检查；修复任何元素溢出、触控目标过小（< 44px）或水平滚动问题；重点检查 `MonthCalendar` 网格和 `QuickScorePanel` 复选框布局
- [ ] T053 执行 `quickstart.md` 端到端验证：按 6 个步骤完整走通；在生产构建（`npm run build && npm run preview`）上验证完整操作流（登录 → 记分 → 月视图 → 翻月 → 登出）

**检查点**：应用成功部署到 GitHub Pages。5 个用户故事全部通过独立验证。导航外壳完整。child 和 parent 角色在移动端视口下端到端行为正确。

---

## 依赖关系与执行顺序

### 阶段依赖

- **第一阶段（初始化）**：无依赖，立即开始
- **第二阶段（基础层）**：依赖第一阶段完成 — ⚠️ 阻塞所有用户故事阶段
- **第三阶段（US1 P1）**：依赖第二阶段，基础完成后最高优先级
- **第四阶段（US2 P1）**：依赖第三阶段，需要 `DayDetailPage` 基础和记录数据
- **第五阶段（US3 P2）**：依赖第二阶段，若有独立开发者可与 US1/US2 并行
- **第六阶段（US4 P2）**：依赖第三阶段，需要 `LoginPage` 和 `DayDetailPage` 完成后加固
- **第七阶段（US5 P3）**：依赖第二阶段，若有独立开发者可与 US1/US2 并行
- **第八阶段（收尾）**：依赖所有用户故事阶段完成

### 用户故事依赖关系

| 故事 | 优先级 | 依赖 | 可并行执行 |
|------|--------|------|-----------|
| US1 - 快速记分 | P1 | 第二阶段 | US3、US5 |
| US2 - 月视图 | P1 | US1（需要 DayDetailPage 基础） | — |
| US3 - 规则管理 | P2 | 第二阶段 | US1、US5 |
| US4 - 访问控制 | P2 | US1（需要 LoginPage） | US3、US5 |
| US5 - 孩子档案 | P3 | 第二阶段 | US1、US3 |

### 每个用户故事内部执行顺序

1. **Service 层**（`services/`）— 无 UI 依赖，可最先实现
2. **Hook 层**（`hooks/`）— 依赖 services
3. **Component 层**（`components/`）— 依赖 hooks；同一故事内标记 [P] 的组件可并行
4. **Page 层**（`pages/`）— 依赖 components

---

## 并行执行示例

### 第二阶段（基础层）

```
同时开始（无依赖）：
  ├── T008  frontend/.env.local.example + .gitignore
  ├── T009  frontend/src/lib/supabase.ts
  └── T010  frontend/src/types/index.ts

T006 + T007（迁移执行完成）且 T008–T010 全部完成后：
  └── T011  frontend/src/main.tsx + App.tsx 路由骨架
```

### 用户故事 1（第三阶段）— 四条并行流

```
第二阶段完成后，同时启动四条并行流：
  流 A（认证）：     T012 → T013 → [T014、T015 并行] → T016
  流 B（孩子数据）： T017 → T018 → T023 [P]
  流 C（规则数据）： T019 → T020
  流 D（记录数据）： T021 → T022 → T024 [P]

四条流全部完成后：
  └── T025 → T026（页面层，集成所有 hook 和组件）
```

### 用户故事 2（第四阶段）— 并行流

```
US1 完成后：
  ├── T027 → T028  月度分数 service → hook（串行）
  ├── T029 [P]     DayCell 组件
  └── T030 [P]     MonthCalendar 组件

T028 + T029 + T030 全部完成后：
  ├── T031         CalendarPage（依赖以上全部）
  ├── T032 [P]     RecordTimeline 组件
  └── T033 → T034 集成到 DayDetailPage，然后实现角色跳转
```

---

## 实现策略

### MVP 范围（仅第一至三阶段，约占总任务量 54%）

完成第一至三阶段可交付**完整可用的记分闭环**：

1. 家长登录
2. 首页显示孩子卡片和实时总分
3. 点击孩子 → CalendarPage（基础版，暂无月历网格，可通过 URL 直接进入日详情）
4. DayDetailPage → QuickScorePanel → 提交记录
5. 记录持久化到 Supabase，含正确快照数据

这足以在投入日历 UI 开发前**验证核心产品假设**。

### 单人开发建议节奏

| 阶段 | 预估工作量 | 里程碑 |
|------|-----------|--------|
| 第一 + 第二阶段 | 1 天 | 工程启动，数据库就绪 |
| 第三阶段（US1） | 2–3 天 | 核心记分闭环可用 |
| 第四阶段（US2） | 1–2 天 | 月视图看板完成 |
| 第五阶段（US3） | 1 天 | 规则管理上线 |
| 第六阶段（US4） | 1 天 | 认证安全加固 |
| 第七阶段（US5） | 1 天 | 孩子档案管理上线 |
| 第八阶段（收尾） | 0.5–1 天 | 生产就绪 |

### Constitution 合规提示

- **MVP 优先**：在第三阶段验证通过前，不实现第五至七阶段的功能
- **不过度设计**：services 是 Supabase 的薄封装——不引入 Repository Pattern 或依赖注入容器
- **安全性**：`insertRecords` 在调用 Supabase 前须校验 `date <= 今天`；不得将 Supabase 原始错误对象暴露到 UI 字符串
- **编码一致性**：所有组件仅使用 Tailwind 类（不使用内联样式）；禁用 `any` 类型；所有异步操作须展示加载态
- **第三方库评审**：除 T002 中安装的包外，任何新增 npm 包均须明确评审后方可引入
