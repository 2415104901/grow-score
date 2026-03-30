# crc:commit

代码审核和提交命令。审核当前代码变更并生成符合规范的 commit message。

## 使用方法

输入 `/crc:commit` 或 `提交代码` 触发。

## 调用方式

通过 @-mention 调用 crc-agent：

```
@crc-agent 审核当前代码变更并生成 commit message
```

或者直接说：
```
使用 crc-agent 审核代码并提交
```

## crc-agent 将会

1. 检查 git 状态和变更
2. 审核代码质量和架构一致性
3. 评估风险（高/中/低）
4. 生成规范的 commit message
5. 展示审核结果并等待批准
