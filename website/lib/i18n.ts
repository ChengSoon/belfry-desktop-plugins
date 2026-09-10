import { english } from "./copy-en";
import { simplifiedChinese } from "./copy-zh";
import type { SiteCopy } from "./copy-types";
import { sitePath } from "./paths";

export const siteLocales = ["en", "zh-CN"] as const;
export const locales = siteLocales;
export type Locale = string;
export const defaultLocale: Locale = "zh-CN";
export const localeCookieName = "belfry-plugins-locale";

const localePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

export const copy: Record<string, SiteCopy> = {
  en: english,
  "zh-CN": simplifiedChinese,
};

function parseLocale(value: unknown): Locale | undefined {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim();
  return localePattern.test(candidate) ? candidate : undefined;
}

export function resolveLocale(value: unknown): Locale {
  return parseLocale(value) ?? defaultLocale;
}

function matchAvailableLocale(
  value: string,
  availableLocales: readonly string[],
): Locale | undefined {
  const normalized = value.toLowerCase();
  const exact = availableLocales.find(
    (locale) => locale.toLowerCase() === normalized,
  );
  if (exact) return exact;
  const base = normalized.split("-")[0];
  return availableLocales.find(
    (locale) => locale.toLowerCase().split("-")[0] === base,
  );
}

function browserLocalePreferences(
  acceptLanguage: string | null | undefined,
): string[] {
  if (!acceptLanguage) return [];
  return acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [range, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const weight = quality ? Number.parseFloat(quality.trim().slice(2)) : 1;
      return { range, weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter(
      ({ range, weight }) =>
        range !== "*" && weight > 0 && localePattern.test(range),
    )
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map(({ range }) => range);
}

export function resolveRequestLocale({
  requested,
  persisted,
  acceptLanguage,
  availableLocales = siteLocales,
}: {
  requested?: unknown;
  persisted?: unknown;
  acceptLanguage?: string | null;
  availableLocales?: readonly string[];
}): Locale {
  const explicit = parseLocale(requested);
  if (explicit && siteLocales.includes(explicit as "en" | "zh-CN"))
    return explicit;

  const stored = parseLocale(persisted);
  if (stored && siteLocales.includes(stored as "en" | "zh-CN")) return stored;

  for (const preference of browserLocalePreferences(acceptLanguage)) {
    const matched = matchAvailableLocale(preference, availableLocales);
    if (matched) return matched;
  }
  return defaultLocale;
}

export function getCopy(locale: Locale): SiteCopy {
  return copy[locale] ?? copy[defaultLocale];
}

export function localeHref(path: string, locale: Locale): string {
  const [pathname, query = ""] = path.split("?");
  const search = new URLSearchParams(query);
  search.set("lang", locale);
  const nextQuery = search.toString();
  const target = sitePath(pathname.endsWith("/") ? pathname : `${pathname}/`);
  return `${target}?${nextQuery}`;
}

export function categoryCopy(category: string, locale: Locale) {
  return (
    getCopy(locale).categories[category] ?? { label: category, description: "" }
  );
}

export function formatLocalizedDate(date: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale || defaultLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  } catch {
    return new Intl.DateTimeFormat(defaultLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  }
}

export function localeLabel(locale: Locale): string {
  if (locale === "en") return "English";
  if (locale === "zh-CN") return "简体中文";
  try {
    return (
      new Intl.DisplayNames([defaultLocale], { type: "language" }).of(locale) ??
      locale
    );
  } catch {
    return locale;
  }
}
