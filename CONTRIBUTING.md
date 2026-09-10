# 制作与发布插件

## 开发

1. 使用 `scripts/new_plugin.py` 创建独立 ID，或在 Belfry 应用内从模板创建后复制到
   `plugins/<id>/`。目录名与 manifest 的 ID 保持一致。
2. 在 Belfry「加载开发插件」中选择目录，实际操作命令、面板、工具和 Skill。
3. 在 `README.md` 写清作用、使用方法、权限和限制。提供作者及许可证。
4. 新能力使用宿主公开的 `pi` API；权限和贡献写入 manifest。完整 API 参考
   [PI plugin-sdk](https://github.com/vastsa/PI-Desktop/tree/main/packages/plugin-sdk)。

模板自动生成 manifest；可以使用不含 UI 的工具或 Skill 包，不要求所有插件都有页面。
源码不得包含凭据、工作区私有资料、符号链接或运行时依赖目录。

## 发布

```sh
python3 scripts/check_plugin.py plugins/myteam.notes
python3 scripts/pack_plugin.py plugins/myteam.notes
python3 scripts/rebuild_catalog.py
python3 scripts/rebuild_catalog.py --check
python3 -m unittest discover -s tests
```

将下面三部分放进同一个 Pull Request：

- `plugins/<id>/` 的源码、版本号和 `CHANGELOG.md`。
- `packages/<id>-<version>.piplug`。
- 重建的 `catalog.json`。

合并后 GitHub raw 目录即可用于搜索、安装和更新。网站需要另行运行 Pages 部署工作流。
不需要额外的账号服务或插件注册服务器。

## 版本与来源一致性

同一个版本不能覆盖为另一份内容。再次打包同样内容会复用原文件；修改插件时请提高
SemVer `version`。打包采用固定 ZIP 时间和排序，产物可重复。目录包含包的 SHA-256、
大小、权限、文件与网络范围，且保留所有已发布版本。

校验会发现源码与当前发布包不一致、包被修改、历史版本丢失，以及目录未更新。
这些检查无法证明插件业务逻辑正确；提交前仍需实际导入打包产物并测试关键操作。

## 撤回版本

保留原包，在对应 `catalog.json` 版本记录中设置：

```json
{
  "yanked": true,
  "yankedReason": "这个版本的具体问题"
}
```

重建目录时会保留撤回标记；网站取消该版本下载入口，Belfry 拒绝安装该版本。
GitHub 历史和静态包仍可被访问，撤回不等同于从互联网上抹除文件。

## 网站与市场配置

修改 `marketplace.json` 可设置仓库、分支、市场名称和首页推荐插件。
网站在构建时读取同一个 catalog，并带上全部发布包，本地与线上使用相同数据。
不要写入虚构的下载量、认证信息或不可用的插件卡片。

网站构建及浏览器验证：

```sh
npm ci --prefix website
npm run build --prefix website
cd website
npx playwright install chromium
npm run test:browser
```

保持页面与 PI 参考布局一致，保留双语、手机布局、键盘可达和错误提示。
格式检查使用 `npm run format:check`。测试只使用临时数据，不连接真实模型服务。
