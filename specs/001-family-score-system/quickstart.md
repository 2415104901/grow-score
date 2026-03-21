# Quickstart: 儿童积分管理系统

**Date**: 2026-03-20 | **Branch**: `001-family-score-system`

---

## 前置要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 20 | 前端构建 |
| pnpm | ≥ 9 | 包管理器（`npm i -g pnpm`） |
| Supabase CLI | ≥ 1.200 | 数据库迁移（`npm i -g supabase`） |
| Supabase 账号 | — | 免费账号即可 |
| Git | — | 版本控制 |

---

## 第一步：创建 Supabase 项目

1. 登录 [supabase.com](https://supabase.com) → New Project
2. 记录以下信息：
   - `Project URL`（格式：`https://xxxx.supabase.co`）
   - `anon public key`（在 Project Settings → API）
3. 在 **Authentication → Settings** 中：
   - 关闭 `Enable email confirmations`（家庭内部使用无需验证邮箱）
   - 将 `JWT expiry` 设为 `315360000`（10 年，单位秒）
   - 将 `Refresh token expiry` 设为 `315360000`

---

## 第二步：初始化数据库

```bash
# 登录 Supabase CLI
supabase login

# 链接到你的项目（替换 <project-ref>，在项目 URL 中可找到）
supabase link --project-ref <project-ref>

# 执行 Schema 迁移
supabase db push < specs/001-family-score-system/contracts/supabase-schema.sql

# 执行 RLS 策略
supabase db push < specs/001-family-score-system/contracts/rls-policies.sql
```

> 或者将两个 SQL 文件内容直接粘贴到 Supabase Dashboard → SQL Editor 执行。

---

## 第三步：手动创建账号

1. 进入 Supabase Dashboard → **Authentication → Users → Add User**
2. 填写邮箱和密码（家长账号）
3. **执行 SQL** 为该用户创建 profile（角色 parent）：

```sql
INSERT INTO profiles (user_id, role, display_name)
VALUES (
  '<user-id-from-auth-dashboard>',
  'parent',
  '爸爸'  -- 或任意名字
);
```

4. 为每个孩子创建 child 记录和账号：

```sql
-- 1. 创建孩子档案
INSERT INTO children (name) VALUES ('小明') RETURNING id;
-- 记录返回的 child_id

-- 2. 在 Dashboard → Auth 新建孩子账号，记录其 user_id

-- 3. 创建孩子 profile
INSERT INTO profiles (user_id, role, child_id, display_name)
VALUES (
  '<child-user-id>',
  'child',
  '<child-id-from-step-1>',
  '小明'
);
```

---

## 第四步：初始化前端

```bash
# 克隆仓库（如果还没有）
git clone <repo-url>
cd grow-score

# 进入前端目录
cd frontend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
```

编辑 `.env.local`：

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 第五步：本地运行

```bash
cd frontend
pnpm dev
```

访问 `http://localhost:5173`，用刚才创建的家长账号登录。

---

## 第六步：部署到 GitHub Pages

在仓库 Settings → Pages 中启用 GitHub Actions 部署，然后在 `.github/workflows/deploy.yml` 中（待创建）配置：

```yaml
- name: Build
  run: pnpm --filter frontend build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

在仓库 Settings → Secrets 中添加上述两个环境变量。

---

## 开发常用命令

```bash
# 本地开发
pnpm --filter frontend dev

# 构建
pnpm --filter frontend build

# 运行测试
pnpm --filter frontend test

# 类型检查
pnpm --filter frontend typecheck
```

---

## 常见问题

**Q: 新增记录后积分没有更新？**  
A: 检查 Supabase RLS 的 `records_insert_parent` 策略是否正确，确认登录用户的 profile.role = 'parent'。

**Q: child 账号看不到数据？**  
A: 确认 `profiles.child_id` 已正确填写，且 `children.is_active = true`。

**Q: 忘记密码怎么办？**  
A: parent 账号在 Supabase Dashboard → Authentication → Users 中重置密码。child 账号由 parent 协助在 Dashboard 操作。

**Q: 如何禁用一个账号？**  
A: 在 Supabase Dashboard → Authentication → Users → 选中用户 → Ban User。这会立即撤销该用户所有 refresh token，使其无法继续使用。
