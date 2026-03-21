## ADDED Requirements

### Requirement: Responsive padding for navigation buttons
导航按钮 SHALL 使用 CSS `clamp()` 函数实现响应式内边距，根据视口宽度在指定范围内动态调整。

#### Scenario: Active state button padding
- **WHEN** 导航按钮处于激活状态
- **THEN** 左右内边距 SHALL 在 28px 至 36px 之间根据视口宽度自动调整
- **AND** 调整公式 SHALL 为 `clamp(28px, 4vw, 36px)`

#### Scenario: Inactive state button padding
- **WHEN** 导航按钮处于非激活状态
- **THEN** 左右内边距 SHALL 在 24px 至 32px 之间根据视口宽度自动调整
- **AND** 调整公式 SHALL 为 `clamp(24px, 3vw, 32px)`

#### Scenario: Desktop-only application
- **WHEN** 用户在桌面端浏览（sm+ 断点）
- **THEN** 响应式 padding SHALL 生效
- **AND** 移动端（< sm 断点） SHALL 继续使用底部导航栏，不受此影响

### Requirement: Text overflow prevention
导航按钮 SHALL 确保文字内容不会溢出背景区域。

#### Scenario: Four-character Chinese labels
- **WHEN** 导航标签包含 4 个中文字符（如"成长指标"、"家庭测评"）
- **THEN** 激活状态的背景区域 SHALL 提供足够的内边距容纳文字和图标
- **AND** 文字 SHALL 不超出背景边界

### Requirement: Visual consistency
导航按钮的间距调整 SHALL 保持视觉一致性和流畅性。

#### Scenario: Smooth transition across viewport sizes
- **WHEN** 用户调整浏览器窗口大小
- **THEN** padding SHALL 在指定范围内平滑过渡
- **AND** 不 SHALL 出现跳跃或突变
