## Context

当前桌面端导航按钮使用固定的 `px-6` (24px) 左右内边距。对于包含 4 个中文字符的标签（如"成长指标"、"家庭测评"）加上图标后，激活状态的黄色背景区域显得拥挤，文字接近边界。

现有代码位于 `frontend/src/components/layout/AppLayout.tsx`，导航按钮通过 `NavLink` 组件实现，激活状态通过 `isActive` 回调函数应用 `bg-amber-400` 背景色。

## Goals / Non-Goals

**Goals:**
- 使用 CSS `clamp()` 函数实现响应式 padding，让按钮内边距随视口自动调整
- 激活状态提供更大的 padding 范围，确保文字有足够的显示空间
- 保持现有的视觉风格和交互行为不变

**Non-Goals:**
- 不改变按钮的激活状态设计（保持黄色 pill 背景样式）
- 不影响移动端底部导航栏
- 不添加新的依赖或库

## Decisions

### 使用 style 属性直接应用 clamp()

**选择**: 在 `NavLink` 的 className 回调中，通过条件判断添加 `style` 属性来应用 `paddingInline`。

```tsx
className={({ isActive }) => {
  const baseClasses = `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full py-2.5 text-sm font-bold transition-all ${
    isActive ? 'bg-amber-400 text-stone-900 shadow-[0_0_16px_rgba(251,191,36,0.5)]' : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`

  const paddingStyle = {
    paddingInline: isActive ? 'clamp(28px, 4vw, 36px)' : 'clamp(24px, 3vw, 32px)'
  }

  return { className: baseClasses, style: paddingStyle }
}}
```

**替代方案**: 使用 Tailwind CSS 的 arbitrary value 或配置自定义类。
- **未采用原因**: Tailwind 默认不包含 clamp() 支持，需要额外配置，直接使用 style 属性更简单直接。

### clamp() 参数选择

- **激活状态**: `clamp(28px, 4vw, 36px)`
  - 最小值 28px：确保小屏幕也有足够空间
  - 理想值 4vw：随视口按比例增长
  - 最大值 36px：避免超大屏幕上按钮过于宽大

- **非激活状态**: `clamp(24px, 3vw, 32px)`
  - 比激活状态略小，保持视觉层次
  - 参数比例相同，确保一致的响应式行为

### 应用范围

仅修改桌面端 `<nav>` 内的 `NavLink` 组件（sm+ 断点可见），不影响：
- Logo 链接
- 移动端底部导航
- 退出登录按钮（保持原有的 `px-6`）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 大屏幕上按钮可能过宽 | 设置最大值上限 (36px) 限制 |
| 小屏幕上可能仍显拥挤 | 设置最小值下限 (28px) 确保底线 |
| 不同浏览器 clamp() 兼容性 | clamp() 已被所有现代浏览器支持 |
| 移动端意外受影响 | 确认修改仅针对桌面端 nav 元素内的组件 |

## Open Questions

（无 - 实现方案清晰明确）
