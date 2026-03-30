# crc:commit

代码审核和提交命令。审核当前代码变更并生成符合规范的 commit message。

## 使用方法

输入 `/crc:commit` 或 `提交代码` 触发。

## 执行步骤

1. 检查 git 状态和变更
2. 审核代码质量和架构一致性
3. 生成规范的 commit message
4. 执行 git commit

## 输出格式

```
[AI Generated] <type>: <subject>

## 核心改动
- <变更列表>

## 设计思路
<设计说明和架构一致性分析>

## 风险评估
| 风险点 | 风险程度 | 缓解措施 |
|--------|----------|----------|
...

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
