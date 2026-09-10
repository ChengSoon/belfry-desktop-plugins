"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultLocale, resolveRequestLocale, type Locale } from "./i18n";

type SiteState = { locale: Locale; query: string; category: string };
const INITIAL: SiteState = {
  locale: defaultLocale,
  query: "",
  category: "all",
};
const SiteContext = createContext<SiteState>(INITIAL);
export const LOCALE_STORAGE_KEY = "belfry-plugins-locale";

function readPreferences(): SiteState {
  const params = new URLSearchParams(window.location.search);
  let persisted: string | null = null;
  try {
    persisted = localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    /* 浏览器可禁用存储。 */
  }
  const locale = resolveRequestLocale({
    requested: params.get("lang"),
    persisted,
    acceptLanguage: navigator.languages.join(","),
  });
  return {
    locale,
    query: params.get("q")?.trim() ?? "",
    category: params.get("category") ?? "all",
  };
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(INITIAL);
  useEffect(() => {
    const next = readPreferences();
    setState(next);
    document.documentElement.lang = next.locale;
  }, []);
  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
