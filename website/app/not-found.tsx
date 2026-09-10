import { sitePath } from "../lib/paths";

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="container empty-state">
        <h1>没有找到这个插件</h1>
        <p>插件可能还未发布，请在目录中查看可用版本。</p>
        <a className="button primary-button" href={sitePath("/plugins/")}>
          浏览插件
        </a>
      </div>
    </main>
  );
}
