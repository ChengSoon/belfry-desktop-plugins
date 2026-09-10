# 文本统计

为 Agent 提供文本统计工具，计算字符、词语和行数，无需访问文件或网络。

## 使用

启用后，让 Agent 调用 inspect_text，参数为 {"text":"hello world"}。它会返回 characters、words、lines；words 按空白分隔。

## 权限

agent.tool.register

仅使用清单声明的 Agent 能力；不访问工作区文件或网络。

## 制作自己的版本

使用仓库中的 `scripts/new_plugin.py` 创建独立 ID，再修改页面和入口。

## 许可证

MIT，Copyright 2026 ChengSoon。
