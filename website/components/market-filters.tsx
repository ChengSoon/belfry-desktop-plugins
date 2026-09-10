"use client";

import { Search } from "lucide-react";
import { catalog } from "../lib/catalog";
import { categoryCopy, getCopy, localeHref } from "../lib/i18n";
import { sitePath } from "../lib/paths";
import { useSite } from "../lib/site-context";

export function MarketSearch() {
  const { locale, query, category } = useSite();
  const copy = getCopy(locale).marketplace;
  return (
    <form className="search-bar" action={sitePath("/plugins/")} role="search">
      <Search size={18} />
      <label htmlFor="plugin-search" className="sr-only">
        {copy.search}
      </label>
      <input
        id="plugin-search"
        name="q"
        key={query}
        defaultValue={query}
        placeholder={copy.searchPlaceholder}
      />
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="category" value={category} />
      <button className="search-submit" type="submit">
        {copy.search}
      </button>
    </form>
  );
}

export function MarketFilters() {
  const { locale, query, category } = useSite();
  const categories = [
    "all",
    ...new Set(catalog.plugins.flatMap((plugin) => plugin.categories)),
  ];
  return (
    <div className="filter-row" aria-label={getCopy(locale).marketplace.kicker}>
      {categories.map((id) => {
        const params = new URLSearchParams({
          category: id,
          ...(query ? { q: query } : {}),
        });
        return (
          <a
            className={`filter-chip ${category === id ? "active" : ""}`}
            key={id}
            aria-current={category === id ? "page" : undefined}
            href={localeHref(`/plugins/?${params}`, locale)}
          >
            {categoryCopy(id, locale).label}
          </a>
        );
      })}
    </div>
  );
}
