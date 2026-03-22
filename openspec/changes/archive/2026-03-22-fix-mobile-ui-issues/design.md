## Context

当前应用使用 React + TailwindCSS 构建，通过 GitHub Pages 部署。移动端用户主要通过系统浏览器访问，但部分用户使用百度浏览器、UC浏览器等第三方浏览器。

**当前状态**:
- `QuickScorePanel` 组件使用 `rounded-2xl bg-white p-4` 样式，无高度限制
- `index.html` 使用标准 viewport 配置：`width=device-width, initial-scale=1.0`
- `AppLayout` 已使用 `min-h-dvh` 和 `env(safe-area-inset-bottom)` 处理安全区域

**约束**:
- 不能破坏桌面端体验
- 需保持与现有 TailwindCSS v4 的一致性
- 不引入新的依赖库

## Goals / Non-Goals

**Goals:**
- 确保快速记分面板在任何屏幕高度下都能正常滚动，操作按钮始终可触达
- 修复百度浏览器等第三方浏览器的渲染异常问题
- 支持各种移动设备的屏幕安全区域（刘海屏、底部指示条等）

**Non-Goals:**
- 不重构整个组件结构
- 不改变现有的业务逻辑和交互方式
- 不添加新的测试（当前项目无测试套件）

## Decisions

### 1. QuickScorePanel 滚动容器方案

**决策**: 为面板内容添加 `max-h-[70dvh]` 和 `overflow-y-auto`

**理由**:
- 使用 `dvh` (Dynamic Viewport Height) 单位更准确地反映移动端可用视口高度
- 限制最大高度为视口的 70%，为标题栏和底部导航栏留出空间
- 按钮区域保持在滚动容器外部，确保始终可见

**替代方案**:
- 使用固定像素高度: 不适配不同屏幕尺寸
- 使用 `calc(100vh - Xpx)`: 复杂且不准确

### 2. Viewport Meta 标签增强

**决策**: 扩展 viewport 配置为：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**理由**:
- `maximum-scale=1.0` 防止用户缩放导致布局错乱
- `user-scalable=no` 进一步确保一致的显示效果
- `viewport-fit=cover` 支持刘海屏等全面屏设备
- 这些属性对百度浏览器等第三方浏览器尤其重要

**替代方案**:
- 保持现有配置: 无法解决第三方浏览器兼容性问题
- 使用 JavaScript 动态调整: 过度复杂，增加性能开销

### 3. 样式实现方式

**决策**: 直接在组件中使用 TailwindCSS 类名

**理由**:
- 项目已使用 TailwindCSS v4，保持一致性
- 无需额外 CSS 文件或配置
- 响应式类名可以针对移动端单独处理

**实现细节**:
```tsx
// 内容区域包裹滚动容器
<div className="max-h-[60dvh] overflow-y-auto px-1">
  {/* 规则列表内容 */}
</div>
```

## Risks / Trade-offs

**[Risk]** 禁用用户缩放可能影响可访问性
**→ Mitigation**: 应用本身已针对移动端优化，字体大小和触控目标尺寸均符合可访问性标准

**[Risk]** `dvh` 单位在旧版浏览器中可能不支持
**→ Mitigation**: 现代移动浏览器均已支持 `dvh`，且降级为 `vh` 时仅导致轻微差异

**[Risk]** 第三方浏览器可能有其他未知兼容性问题
**→ Mitigation**: 通过用户反馈持续收集问题，进行针对性修复

## Migration Plan

1. 更新 `frontend/index.html` 中的 viewport meta 标签
2. 修改 `QuickScorePanel.tsx` 添加滚动容器样式
3. 本地测试验证（使用 Chrome DevTools 移动端模拟）
4. 部署到 GitHub Pages 进行真机测试
5. 收集反馈并进行必要调整

**Rollback**: 通过 git revert 可快速回滚到之前版本

## Open Questions

- 是否需要在其他面板组件（如 `RuleForm`, `ChildForm`）中应用相同的滚动容器模式？
  - **待确认**: 观察这些组件是否存在类似问题后再决定
