"use client";

import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  currentVersion,
  localizedPlugin,
  packageUrl,
  type Plugin,
} from "../lib/catalog";
import { categoryCopy, getCopy, localeHref } from "../lib/i18n";
import { useSite } from "../lib/site-context";
import { CopyButton } from "./copy-button";
import { PluginIcon } from "./icons";
import { PluginFacts, PluginPermissions, PluginVersions } from "./plugin-facts";

function DetailActions({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  const copy = getCopy(locale).detail;
  const version = currentVersion(plugin);
  return (
    <div className="detail-actions">
      {!version.yanked ? (
        <a href={packageUrl(plugin)} download className="button primary-button">
          <Download size={16} />
          {copy.download}
        </a>
      ) : null}
      {!version.yanked ? (
        <CopyButton value={packageUrl(plugin)} label={copy.copyUrl} />
      ) : null}
      <a
        href={plugin.repository}
        target="_blank"
        rel="noreferrer"
        className="button secondary-button"
      >
        {copy.source}
        <ArrowUpRight size={15} />
      </a>
    </div>
  );
}

function DetailHeading({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  const content = localizedPlugin(plugin, locale);
  return (
    <div className="detail-heading">
      <div className="detail-icon">
        <PluginIcon id={plugin.id} category={plugin.categories[0]} />
      </div>
      <h1>{content.name}</h1>
      <p>{content.description}</p>
      <div className="detail-meta">
        <span>
          {getCopy(locale).detail.by} {plugin.author}
        </span>
        <span>v{currentVersion(plugin).version}</span>
        {plugin.categories.map((category) => (
          <span className="tag" key={category}>
            {categoryCopy(category, locale).label}
          </span>
        ))}
      </div>
      <DetailActions plugin={plugin} />
    </div>
  );
}

function PluginReadme({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  const content = localizedPlugin(plugin, locale);
  return (
    <article className="detail-content">
      <h2>{getCopy(locale).detail.about}</h2>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{ h1: ({ children }) => <h2>{children}</h2> }}
      >
        {content.readmeMarkdown || getCopy(locale).detail.noReadme}
      </ReactMarkdown>
      <PluginVersions plugin={plugin} />
    </article>
  );
}

export function PluginDetail({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  return (
    <main className="detail-shell">
      <div className="container">
        <div className="breadcrumbs">
          <a href={localeHref("/plugins/", locale)}>
            <ArrowLeft size={14} />
            {getCopy(locale).detail.plugins}
          </a>
          <span>/</span>
          <span>{localizedPlugin(plugin, locale).name}</span>
        </div>
        <div className="detail-layout">
          <div>
            <DetailHeading plugin={plugin} />
            <PluginReadme plugin={plugin} />
          </div>
          <aside className="detail-aside">
            <PluginFacts plugin={plugin} />
            <PluginPermissions plugin={plugin} />
          </aside>
        </div>
      </div>
    </main>
  );
}
