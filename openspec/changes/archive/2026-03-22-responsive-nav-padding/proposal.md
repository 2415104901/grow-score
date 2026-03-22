## Why

导航栏按钮在激活状态下背景区域过小，导致文字（特别是4个中文字符的标签如"成长指标"、"家庭测评"）显示拥挤，视觉效果不佳。

## What Changes

- 修改桌面端导航按钮的内边距样式，使用 CSS `clamp()` 函数实现响应式 padding
- 激活状态的按钮使用更大的 padding 范围（28px-36px）
- 非激活状态的按钮使用适中的 padding 范围（24px-32px）
- padding 会根据视口宽度在指定范围内自动调整，实现更流畅的响应式效果

## Capabilities

### New Capabilities
- `responsive-nav-spacing`: 导航按钮响应式间距能力，定义使用 clamp() 实现动态内边距的规范

### Modified Capabilities
（无 - 这是纯 UI 样式调整，不涉及功能需求变更）

## Impact

- **修改文件**: `frontend/src/components/layout/AppLayout.tsx`
- **影响范围**: 桌面端导航栏（sm+ 断点）
- **无 API 变更**: 纯前端样式调整
- **无依赖变更**: 使用原生 CSS 函数，无需新增依赖
