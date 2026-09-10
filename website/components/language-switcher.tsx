"use client";

import { Languages } from "lucide-react";
import { getCopy, localeLabel, siteLocales, type Locale } from "../lib/i18n";
import { LOCALE_STORAGE_KEY } from "../lib/site-context";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  function change(value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    } catch {
      /* URL 仍保留语言。 */
    }
    window.location.assign(url.href);
  }
  return (
    <label className="language-switcher">
      <Languages size={14} aria-hidden="true" />
      <select
        value={locale}
        aria-label={getCopy(locale).nav.language}
        onChange={(event) => change(event.target.value)}
      >
        {siteLocales.map((value) => (
          <option key={value} value={value}>
            {localeLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );
}
