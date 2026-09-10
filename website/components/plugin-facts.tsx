"use client";

import {
  currentVersion,
  formatBytes,
  localizedPlugin,
  type Plugin,
} from "../lib/catalog";
import { formatLocalizedDate, getCopy } from "../lib/i18n";
import { sitePath } from "../lib/paths";
import { useSite } from "../lib/site-context";

export function PluginFacts({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  const copy = getCopy(locale).detail;
  const version = currentVersion(plugin);
  const facts = [
    [copy.latestVersion, version.version],
    [copy.packageSize, formatBytes(version.sizeBytes)],
    [copy.published, formatLocalizedDate(version.publishedAt, locale)],
    [copy.requires, `PI API ≥ ${version.minPiDesktop ?? "0.1.0"}`],
  ];
  return (
    <section className="aside-card">
      <h2>{copy.facts}</h2>
      {facts.map(([label, value]) => (
        <div className="fact-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      <p className="safety-note">SHA-256</p>
      <code className="package-hash">{version.shasum}</code>
    </section>
  );
}

export function PluginPermissions({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  const copy = getCopy(locale).detail;
  const version = currentVersion(plugin);
  return (
    <section className="aside-card">
      <h2>{copy.permissions}</h2>
      <div className="permission-list">
        {version.permissions.map((permission) => (
          <span className="permission-name" key={permission}>
            {permission}
          </span>
        ))}
      </div>
      {!version.permissions.length ? (
        <p className="safety-note">{copy.noPermissions}</p>
      ) : null}
      {version.fs ? (
        <pre className="policy-json">
          {JSON.stringify({ fs: version.fs }, null, 2)}
        </pre>
      ) : null}
      {version.net ? (
        <pre className="policy-json">
          {JSON.stringify({ net: version.net }, null, 2)}
        </pre>
      ) : null}
      <p className="safety-note">
        {localizedPlugin(plugin, locale).safetyNotes}
      </p>
      <h2>{copy.installTitle}</h2>
      <p className="safety-note">{copy.installDescription}</p>
    </section>
  );
}

export function PluginVersions({ plugin }: { plugin: Plugin }) {
  const { locale } = useSite();
  return (
    <details className="version-list">
      <summary>
        {locale === "zh-CN" ? "版本记录" : "Version history"} ·{" "}
        {plugin.versions.length}
      </summary>
      {plugin.versions.map((version) => (
        <div className="version-entry" key={version.version}>
          <strong>v{version.version}</strong>
          {version.yanked ? (
            <span>{locale === "zh-CN" ? "已撤回" : "Yanked"}</span>
          ) : (
            <a href={sitePath(`/${version.url}`)} download>
              {getCopy(locale).detail.download}
            </a>
          )}
          <p>{formatLocalizedDate(version.publishedAt, locale)}</p>
          {version.changelog ? <pre>{version.changelog}</pre> : null}
        </div>
      ))}
    </details>
  );
}
