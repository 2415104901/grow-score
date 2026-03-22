## ADDED Requirements

### Requirement: 禁止用户缩放以保持布局一致

应用 SHALL 配置 viewport 以禁止用户缩放页面，确保在所有移动浏览器上保持一致的布局和显示效果。

#### Scenario: 用户无法通过手势缩放页面
- **WHEN** 用户在移动浏览器中尝试使用双指缩放手势
- **THEN** 页面 SHALL 不响应缩放操作
- **AND** 页面 SHALL 保持初始缩放比例

#### Scenario: 页面加载时使用正确缩放比例
- **WHEN** 用户首次打开应用或刷新页面
- **THEN** 页面 SHALL 以 1.0 的缩放比例加载
- **AND** 内容 SHALL 正常显示，无异常缩放

### Requirement: 限制最大缩放比例

Viewport 配置 SHALL 设置最大缩放比例为 1.0，防止浏览器自动缩放导致布局错乱。

#### Scenario: 百度浏览器不自动缩放页面
- **WHEN** 应用在百度浏览器中打开
- **THEN** 浏览器 SHALL 不自动缩放页面
- **AND** 布局 SHALL 与其他主流移动浏览器保持一致

#### Scenario: 文本输入时不触发自动缩放
- **WHEN** 用户点击输入框开始输入文本
- **THEN** 页面 SHALL 不自动放大
- **AND** 输入框 SHALL 保持原始大小

### Requirement: 支持全面屏设备视口配置

Viewport 配置 SHALL 使用 `viewport-fit=cover` 属性，支持刘海屏等全面屏设备的完整显示区域。

#### Scenario: 刘海屏设备利用完整显示区域
- **WHEN** 应用在带有刘海屏的设备上运行
- **THEN** 页面内容 SHALL 延伸至刘海区域下方
- **AND** 应用 SHALL 使用完整的可用显示区域

#### Scenario: 内容不被系统UI遮挡
- **WHEN** 页面内容延伸至屏幕边缘
- **THEN** 关键内容（如导航按钮） SHALL 不被系统UI遮挡
- **AND** 应用 SHALL 使用 CSS 环境变量处理安全区域

### Requirement: 第三方浏览器兼容性

应用 SHALL 在主流第三方移动浏览器（如百度浏览器、UC浏览器、QQ浏览器等）中正常显示和交互。

#### Scenario: 百度浏览器正确渲染布局
- **WHEN** 应用在百度浏览器中打开
- **THEN** 页面 SHALL 正确渲染所有UI元素
- **AND** 布局 SHALL 与系统浏览器保持一致

#### Scenario: UC浏览器交互正常
- **WHEN** 用户在UC浏览器中使用应用
- **THEN** 所有交互元素（按钮、链接、表单） SHALL 正常响应
- **AND** 页面 SHALL 无异常缩放或布局错乱
