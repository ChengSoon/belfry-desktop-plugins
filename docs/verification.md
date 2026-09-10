# 本地交付验证

验证日期：2026-09-10。由主会话直接实现和自审，未委派。

## 已执行

| 项目 | 结果 |
| --- | --- |
| `python3 -m unittest discover -s tests` | 17 项通过 |
| `python3 scripts/check_plugin.py --all` | 三个初始插件均通过 |
| `python3 scripts/rebuild_catalog.py --check` | 目录、源码及包一致 |
| `python3 scripts/check_python_structure.py` | 19 文件，无违规 |
| `node scripts/check_web_structure.mjs` | 43 文件，无违规 |
| 网站格式、类型检查及构建 | 通过 |
| Playwright 浏览器验证 | 同一组 6 项在根路径与 GitHub Pages 子路径均通过 |
| `tests/host-interop.mjs` | 真实 Belfry Node 宿主 3 项通过 |
| Belfry Rust 安装器 | 使用原始工作便笺包完成预览与安装的定向测试通过 |

发布回归覆盖可重复打包、同版本不可覆盖、旧版本保留、包被篡改、源码与包不同步、
重复 JSON、链接、越界、大小限制、Windows 文件名和大小写冲突。
网页验证搜索与分类组合、语言保持、实际下载 SHA-256、剪贴板拒绝提示及手机布局。

真实宿主验证中，三个下载包均加载成功；文本工具与 Skill 可调用；工作便笺保存中文和
Emoji，重载后仍保留，超限输入被拒绝。四种新建模板均通过宿主清单校验和激活。

网页截图由真实 Chromium 生成，位于 `test-results/`（不纳入源码提交）。本地预览为
`http://127.0.0.1:8766/belfry-desktop-plugins/`，预览服务仅监听本机。

## 自审修复

- 目录检查原先只确认版本存在，现同时验证源码与对应版本包内容一致。
- 包写入改为临时文件与原子创建，防止中断产生半个已发布包。
- 补齐 Windows 保留名称、大小写别名及文件/目录冲突校验。
- 修复复制按钮可访问名称、详情页标题层级、搜索按钮换行和窄屏布局。
- 不把第三方市场条目、虚构下载量或认证标记作为自有内容。

## 交付边界

目标仓库 `ChengSoon/belfry-desktop-plugins` 尚未创建，未提交或推送；GitHub Actions 和
Pages 工作流已准备，但不能声称在线 CI 或部署已经成功。
桌面完整程序另已构建独立 QA；Computer Use 连接启动失败，最新桌面窗口复核未完成。
发布脚本执行基本静态检查，复杂插件仍应按贡献说明在真实宿主中验证业务行为。

网站基于 PI 插件中心 MIT 源码改编。独立项目未包含 Belfry / PI 桌面宿主源码，
各自许可证边界见 [NOTICE.md](../NOTICE.md)。
