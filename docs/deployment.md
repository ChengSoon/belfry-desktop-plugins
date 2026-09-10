# 发布到 GitHub 与 GitHub Pages

本项目使用公开仓库 `ChengSoon/belfry-desktop-plugins` 的 `main` 分支发布插件源码、
版本包和目录，GitHub Pages 发布静态网站。两者使用同一份 `catalog.json`。

## 当前发布

2026-09-10 已公开 [源码仓库](https://github.com/ChengSoon/belfry-desktop-plugins)，
并通过 GitHub Actions 部署到 <https://chengsoon.github.io/belfry-desktop-plugins/>。
[首次校验](https://github.com/ChengSoon/belfry-desktop-plugins/actions/runs/34435138143)与
[首次 Pages 部署](https://github.com/ChengSoon/belfry-desktop-plugins/actions/runs/34435296505)均成功。
线上测试与下载验证见 [验证记录](./verification.md#公开发布与线上验证)。

## 公开仓库

将本目录作为独立仓库提交到目标 GitHub 仓库的 `main` 分支。
确保上传 `plugins/`、`packages/` 和 `catalog.json`；`website/node_modules`、构建产物、
临时测试结果及环境文件由 `.gitignore` 排除。

目标市场地址：

```text
https://raw.githubusercontent.com/ChengSoon/belfry-desktop-plugins/main/catalog.json
```

GitHub raw 市场在仓库发布后即可使用，与 Pages 网站部署相互独立。
首次发布前，客户端会说明目录尚不存在，并保留原来可用的市场；本地目录和包不等于已上线。

## Pages 网站

1. 仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。
2. Actions → Deploy plugin website → Run workflow。
3. 成功后工作流输出实际网站地址；不要把配置目标当作已部署结果。

项目站点地址为 `https://chengsoon.github.io/belfry-desktop-plugins/`。
工作流自动设置 `NEXT_PUBLIC_BASE_PATH=/belfry-desktop-plugins`，静态链接和资源
都使用同一个路径。域名或仓库名改变时，先调整配置并重建，不能只移动旧构建产物。

本地模拟项目路径：

```sh
NEXT_PUBLIC_BASE_PATH=/belfry-desktop-plugins npm run build --prefix website
python3 scripts/serve_website.py --base-path /belfry-desktop-plugins --port 8767
```

网站的 `/catalog.json` 和 `/packages/` 也可作为一个完整自有市场。默认复制按钮给出
GitHub raw 地址，便于让客户端在网站未部署时也能使用同一来源。

## 更换为其他仓库

修改 `marketplace.json` 的 `repository`、`branch` 和名称；运行重建目录与网站构建。
在 Belfry 中通过「自有在线市场」输入新地址。已安装插件保留原来源身份，切换来源
不会使自动更新悄悄信任另一个目录。

Pages 不支持服务器端路由或 Next.js API Route。本项目使用静态导出，查询和语言选择
在浏览器中执行，因此可以部署到 GitHub Pages 或普通静态托管服务。
