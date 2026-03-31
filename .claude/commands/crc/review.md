# crc:review

代码审核命令。审核当前代码变更的质量和架构一致性。

## 使用方法

输入 `/crc:review` 或 `审核代码` 触发。

## 调用方式

通过 @-mention 调用 crc-agent：

```
@crc-agent 审核当前代码变更（仅审核，不生成 commit message）
```

或者直接说：
```
使用 crc-agent 审核代码
```

## crc-agent 将会

1. 检查 git 状态和变更
2. 审核代码质量和架构一致性
3. 评估风险（高/中/低）
4. 提供结构化的审核报告
5. **不生成 commit message**（仅审核）
