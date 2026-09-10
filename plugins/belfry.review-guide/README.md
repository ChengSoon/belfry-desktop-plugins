# 代码审查指南

把基于证据的代码审查步骤带入当前会话，覆盖行为、边界和验证。

## 使用

启用后，当前 Agent 可以读取 review-changes Skill，按其中步骤审查工作区修改。插件只提供指南，不会自动修改代码。

## 权限

agent.prompt.inject

仅使用清单声明的 Agent 能力；不访问工作区文件或网络。

## 制作自己的版本

使用仓库中的 `scripts/new_plugin.py` 创建独立 ID，再修改页面和入口。

## 许可证

MIT，Copyright 2026 ChengSoon。
