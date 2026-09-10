"use client";

import { ArrowUpRight, Github } from "lucide-react";
import { BrandMark } from "./icons";
import { REPOSITORY_URL } from "../lib/catalog";
import { getCopy, localeHref } from "../lib/i18n";
import { useSite } from "../lib/site-context";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const { locale } = useSite();
  const copy = getCopy(locale);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          href={localeHref("/", locale)}
          className="brand"
          aria-label="Belfry Plugins"
        >
          <BrandMark className="brand-mark" />
          <span>
            Belfry <span className="brand-muted">Plugins</span>
          </span>
        </a>
        <nav
          className="desktop-nav"
          aria-label={locale === "zh-CN" ? "主导航" : "Main navigation"}
        >
          <a href={localeHref("/plugins/", locale)}>{copy.nav.browse}</a>
          <a href={localeHref("/docs/", locale)}>{copy.nav.build}</a>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            {copy.nav.github} <ArrowUpRight size={14} />
          </a>
          <LanguageSwitcher locale={locale} />
        </nav>
        <div className="mobile-actions">
          <LanguageSwitcher locale={locale} />
          <a
            className="header-github"
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Github size={17} />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { locale } = useSite();
  const copy = getCopy(locale);
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <a href={localeHref("/", locale)} className="brand footer-brand">
            <BrandMark className="brand-mark" />
            <span>Belfry Plugins</span>
          </a>
          <p className="footer-copy">{copy.footer.description}</p>
        </div>
        <div className="footer-links">
          <a href={localeHref("/plugins/", locale)}>
            {copy.footer.marketplace}
          </a>
          <a href={localeHref("/docs/", locale)}>{copy.footer.contributing}</a>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            {copy.footer.source}
          </a>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </footer>
  );
}
