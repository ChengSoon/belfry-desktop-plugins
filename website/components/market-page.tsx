"use client";

import {
  catalog,
  localizedPlugin,
  pluginSearchText,
  sortPlugins,
} from "../lib/catalog";
import { formatLocalizedDate, getCopy, localeHref } from "../lib/i18n";
import { useSite } from "../lib/site-context";
import { MarketFilters, MarketSearch } from "./market-filters";
import { MarketConnect } from "./market-connect";
import { PluginCard } from "./plugin-card";

function MarketHeading() {
  const { locale } = useSite();
  const copy = getCopy(locale).marketplace;
  return (
    <div className="page-heading">
      <div>
        <p className="section-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>
      <span className="catalog-date">
        {copy.updated} {formatLocalizedDate(catalog.updatedAt, locale)}
      </span>
    </div>
  );
}

function MarketResults() {
  const { locale, query, category } = useSite();
  const copy = getCopy(locale).marketplace;
  const plugins = sortPlugins(
    catalog.plugins.filter((plugin) => {
      const text = `${pluginSearchText(plugin)} ${pluginSearchText(localizedPlugin(plugin, locale))}`;
      return (
        (!query || text.includes(query.toLowerCase())) &&
        (category === "all" || plugin.categories.includes(category))
      );
    }),
  );
  const label = plugins.length === 1 ? copy.resultOne : copy.resultMany;
  return (
    <>
      <div className="catalog-result" role="status">
        <span>
          {plugins.length} {label}
          {query ? ` ${copy.matching} “${query}”` : ""}
        </span>
        <span>{copy.packageNote}</span>
      </div>
      {plugins.length ? (
        <div className="catalog-grid">
          {plugins.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>{copy.emptyTitle}</strong>
          <p>{copy.emptyDescription}</p>
          <a className="text-link" href={localeHref("/plugins/", locale)}>
            {locale === "zh-CN" ? "清除筛选" : "Clear filters"}
          </a>
        </div>
      )}
    </>
  );
}

export function MarketPage() {
  return (
    <main className="page-shell">
      <div className="container">
        <MarketHeading />
        <MarketSearch />
        <MarketFilters />
        <MarketResults />
        <MarketConnect />
      </div>
    </main>
  );
}
