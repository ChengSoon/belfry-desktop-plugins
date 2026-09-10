# Belfry Plugins

Belfry 的独立开源插件中心：插件源码、可安装包、市场目录和网站放在同一个仓库。
发布结构与页面改编自 [PI 插件中心](https://github.com/vastsa/pi-desktop-plugins)，
使用 PI 兼容的 `manifest.json` 和 `.piplug` 格式。来源和许可证见 [NOTICE.md](./NOTICE.md)。

源码仓库：[ChengSoon/belfry-desktop-plugins](https://github.com/ChengSoon/belfry-desktop-plugins)

插件网站：[Belfry Plugins](https://chengsoon.github.io/belfry-desktop-plugins/)

市场目录：`https://raw.githubusercontent.com/ChengSoon/belfry-desktop-plugins/main/catalog.json`

## 使用插件

在 Belfry「设置 → 插件 → 插件市场」选择「Belfry 插件中心 · GitHub」。
也可以在网站下载 `.piplug`，再从应用的「导入插件」选择文件。
使用自己 fork 的市场时，将其 `catalog.json` 地址填入「自有在线市场」。

当前提供三个真实插件，均包含源码和安装包：

| 插件 | 功能 | 权限 |
| --- | --- | --- |
| `belfry.quick-notes` | 保存本机工作便笺，关闭后继续编辑 | `ui.panel` |
| `belfry.text-tools` | Agent 调用字符、词语和行数统计 | `agent.tool.register` |
| `belfry.review-guide` | 在会话中使用代码审查 Skill | `agent.prompt.inject` |

这些插件不访问网络或工作区文件。插件宿主对安装、启用和新增权限进行确认。

## 制作插件

需要 Python 3.9+。创建时自动生成清单，安装者不需要手写 `manifest.json`。

```sh
python3 scripts/new_plugin.py myteam.notes \
  --name "我的便笺" --author "你的名字" --template panel-basic
```

模板：`panel-basic`、`agent-tool-basic`、`skill-pack`、`full-demo`。
在 Belfry 中加载 `plugins/myteam.notes` 开发目录，编辑 `main.js` 或 `renderer/index.html`，
通过开发模式热重载调试。`main.js` 使用宿主注入的 `pi` API；页面通过
`window.pluginBridge.invoke(channel, payload)` 与入口的 `onPanelInvoke` 通信。

```sh
python3 scripts/check_plugin.py plugins/myteam.notes
python3 scripts/pack_plugin.py plugins/myteam.notes
python3 scripts/rebuild_catalog.py
python3 scripts/rebuild_catalog.py --check
```

清单和基本资源检查通过后，还应在宿主中验证行为。修改已发布插件时提高 `version`，
更新 `CHANGELOG.md` 后重新打包；旧版本不能覆盖，也不能从目录中丢失。
发布步骤和撤回方式见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 运行网站

网站沿用上游的 Next.js、React、首页、分类搜索、插件详情、双语和开发文档。
改为静态导出，无需服务器或注册系统；安装目录与包同时随网站导出。

需要 Node.js 20.9+，CI 使用 Node.js 22。

```sh
cd website
npm ci
npm run dev
```

构建和预览：

```sh
cd website
npm run build
cd ..
python3 scripts/serve_website.py --port 8767
```

打开 `http://127.0.0.1:8767/`，可搜索插件和下载包。本地客户端也可以接入
`http://127.0.0.1:8767/catalog.json`。

更新 GitHub Pages：仓库 Settings → Pages 选择 GitHub Actions，手动运行
「Deploy plugin website」工作流。工作流使用仓库名称作为子路径；自定义域名或用户根站点
部署时将 `NEXT_PUBLIC_BASE_PATH` 设为空。详细步骤见 [docs/deployment.md](./docs/deployment.md)。

## 目录结构

```text
plugins/<id>/           插件源码、清单、README、变更记录
packages/*.piplug       不可变的版本包
catalog.json           自动生成的 PI 兼容目录
marketplace.json       市场名称、仓库、分支和推荐插件
scripts/               模板、校验、打包、目录、网站准备工具
website/               静态 Next.js 插件中心
tests/                 发布工具及真实宿主互操作测试
.github/workflows/     校验和 Pages 部署
```

## 验证

```sh
python3 -m unittest discover -s tests
python3 scripts/check_plugin.py --all
python3 scripts/rebuild_catalog.py --check
cd website
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

桌面宿主互操作测试（需要含插件功能的 Belfry 源码）：

```sh
BELFRY_DESKTOP_ROOT=/path/to/belfry-desktop node --test tests/host-interop.mjs
```

目录数据不包含虚构的下载量或认证标记。MIT，原始网站 Copyright 2026 vastsa，
Belfry 新增与修改 Copyright 2026 ChengSoon。
