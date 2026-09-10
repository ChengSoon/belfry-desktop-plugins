"use client";

import {
  ArrowRight,
  ChevronRight,
  Code2,
  LockKeyhole,
  PackageCheck,
} from "lucide-react";
import { catalog, featuredPlugins } from "../lib/catalog";
import { categoryCopy, getCopy, localeHref } from "../lib/i18n";
import { useSite } from "../lib/site-context";
import { PluginCard } from "./plugin-card";
import { PluginIcon } from "./icons";

const categories = [
  ...new Set(catalog.plugins.flatMap((plugin) => plugin.categories)),
];

export function CatalogStats() {
  const { locale } = useSite();
  const labels = getCopy(locale).home.stats;
  const values = [catalog.plugins.length, categories.length, "100%", "0"];
  return (
    <section
      className="stats-strip"
      aria-label={locale === "zh-CN" ? "目录统计" : "Catalog stats"}
    >
      <div className="container stats-grid">
        {values.map((value, index) => (
          <div className="stat" key={labels[index]}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{labels[index]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedSection() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">{copy.startKicker}</p>
            <h2>{copy.startTitle}</h2>
            <p className="section-intro">{copy.startDescription}</p>
          </div>
          <a href={localeHref("/plugins/", locale)} className="text-link">
            {copy.viewAll}
            <ArrowRight size={15} />
          </a>
        </div>
        <div className="plugin-grid">
          {featuredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              locale={locale}
              featured
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategorySection() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">{copy.exploreKicker}</p>
            <h2>{copy.exploreTitle}</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((id) => (
            <a
              className="category-card"
              key={id}
              href={localeHref(`/plugins/?category=${id}`, locale)}
            >
              <div className="category-icon">
                <PluginIcon category={id} />
              </div>
              <div>
                <strong>{categoryCopy(id, locale).label}</strong>
                <span>{categoryCopy(id, locale).description}</span>
              </div>
              <ChevronRight
                size={16}
                style={{ marginLeft: "auto", color: "var(--text-faint)" }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  const icons = [Code2, LockKeyhole, PackageCheck];
  return (
    <section className="section trust-section">
      <div className="container">
        <p className="section-kicker">{copy.trustKicker}</p>
        <h2>{copy.trustTitle}</h2>
        <p className="section-intro">{copy.trustDescription}</p>
        <div className="trust-grid">
          {copy.trustItems.map((item, index) => {
            const Icon = icons[index];
            return (
              <div className="trust-item" key={item.number}>
                <span className="trust-number">{item.number}</span>
                <h3>
                  <Icon size={17} />
                  {item.title}
                </h3>
                <p>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BuilderSection() {
  const { locale } = useSite();
  const copy = getCopy(locale).home;
  return (
    <section className="cta-band">
      <div className="container cta-band-inner">
        <div>
          <p className="section-kicker">{copy.builderKicker}</p>
          <h2>{copy.builderTitle}</h2>
          <p>{copy.builderDescription}</p>
        </div>
        <a
          href={localeHref("/docs/", locale)}
          className="button primary-button"
        >
          {copy.builderButton}
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
