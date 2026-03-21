## 1. Implementation

- [x] 1.1 修改 AppLayout.tsx 中的桌面端导航 NavLink 组件，移除固定的 `px-6` 类名
- [x] 1.2 为 NavLink 组件添加 `style` 属性，使用 `paddingInline` 配合 `clamp()` 函数
- [x] 1.3 激活状态应用 `clamp(28px, 4vw, 36px)`，非激活状态应用 `clamp(24px, 3vw, 32px)`

## 2. Verification

- [ ] 2.1 在桌面端浏览器中测试导航按钮，确认激活状态下背景区域足够宽
- [ ] 2.2 调整浏览器窗口大小，验证 padding 随视口平滑过渡
- [ ] 2.3 确认移动端底部导航栏不受影响
- [ ] 2.4 检查"成长指标"、"家庭测评"等 4 字标签不再溢出背景区域
