"use client";

import { ArrowRight, Check } from "lucide-react";
import { featuredPlugins, localizedPlugin } from "../lib/catalog";
import { categoryCopy, getCopy, localeHref } from "../lib/i18n";
import { useSite } from "../lib/site-context";

function PluginPreview() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  return (
    <div className="workspace-preview">
      <div className="preview-header">
        <span>{copy.previewTitle}</span>
        <span className="preview-status">
          <i />
          {copy.previewReady}
        </span>
      </div>
      {featuredPlugins.slice(0, 3).map((plugin) => (
        <a
          className="preview-item"
          key={plugin.id}
          href={localeHref(`/plugins/${plugin.id}/`, locale)}
        >
          <span className="preview-icon">
            <Check size={15} />
          </span>
          <strong>{localizedPlugin(plugin, locale).name}</strong>
          <span>{categoryCopy(plugin.categories[0], locale).label}</span>
        </a>
      ))}
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="terminal-card" aria-label="Belfry plugin catalog">
      <div className="terminal-topbar">
        <div className="terminal-dots">
          <i />
          <i />
          <i />
        </div>
        <span>belfry / extensions</span>
        <span>local</span>
      </div>
      <div className="terminal-body">
        <div className="code-line">
          <span className="code-number">01</span>
          <span>
            <span className="code-keyword">const</span> workspace ={" "}
            <span className="code-string">&quot;your rules&quot;</span>
          </span>
        </div>
        <div className="code-line">
          <span className="code-number">02</span>
          <span>
            <span className="code-keyword">const</span> plugins ={" "}
            <span className="code-string">&quot;your choice&quot;</span>
          </span>
        </div>
        <div className="code-line">
          <span className="code-number">03</span>
          <span className="code-muted">
            {"// extend without leaving your flow"}
          </span>
        </div>
        <PluginPreview />
      </div>
    </div>
  );
}

export function HomeHero() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">
            <i className="eyebrow-dot" />
            {copy.eyebrow}
          </div>
          <h1>
            {copy.titlePrefix} <span>{copy.titleAccent}</span>
          </h1>
          <p className="hero-copy">{copy.description}</p>
          <div className="hero-actions">
            <a
              href={localeHref("/plugins/", locale)}
              className="button primary-button"
            >
              {copy.browse}
              <ArrowRight size={16} />
            </a>
            <a
              href={localeHref("/docs/", locale)}
              className="button secondary-button"
            >
              {copy.build}
            </a>
          </div>
          <p className="hero-note">{copy.note}</p>
        </div>
        <TerminalPreview />
      </div>
    </section>
  );
}
