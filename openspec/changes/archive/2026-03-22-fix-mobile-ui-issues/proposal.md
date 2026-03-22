## Why

当前移动端存在两个关键UI问题影响用户体验：(1) 快速记分面板（QuickScorePanel）在规则列表较长时内容溢出，保存按钮被遮挡无法点击；(2) 百度浏览器等第三方浏览器存在渲染异常，页面缩放和布局错乱。这些问题直接影响了家长在移动设备上正常使用应用的能力。

## What Changes

- 为快速记分面板添加滚动容器和最大高度限制，确保在长列表情况下按钮始终可见
- 优化 viewport meta 标签配置，添加额外的兼容性属性以支持更多移动浏览器
- 为面板内容区域添加适当的移动端内边距和安全区域处理

## Capabilities

### New Capabilities
- `mobile-responsive-panels`: 移动端响应式面板组件，确保内容在长列表时正确滚动且操作按钮始终可见
- `cross-browser-viewport`: 跨浏览器视口兼容性配置，支持主流移动浏览器（包括百度浏览器、UC浏览器等）

### Modified Capabilities
- 无需修改现有能力的规格定义，仅为实现层面的UI优化

## Impact

**Affected Code**:
- `frontend/src/components/records/QuickScorePanel.tsx` - 添加滚动容器和高度限制
- `frontend/index.html` - 更新 viewport meta 标签

**No Breaking Changes**:
- 纯UI层优化，不影响现有API和数据结构
- 不影响桌面端显示效果
- 不改变任何业务逻辑
