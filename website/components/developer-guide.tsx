"use client";

import { ArrowUpRight, Code2, Package, ShieldCheck } from "lucide-react";
import { REPOSITORY_URL } from "../lib/catalog";
import { getCopy } from "../lib/i18n";
import { useSite } from "../lib/site-context";
import { MarketConnect } from "./market-connect";

function GuideSteps() {
  const { locale } = useSite();
  const copy = getCopy(locale).docs;
  const steps = [
    {
      Icon: Code2,
      title: copy.templateTitle,
      description: copy.templateDescription,
    },
    {
      Icon: ShieldCheck,
      title: copy.permissionTitle,
      description: copy.permissionDescription,
    },
    {
      Icon: Package,
      title: copy.packageTitle,
      description: copy.packageDescription,
    },
  ];
  return (
    <div className="trust-grid docs-trust-grid">
      {steps.map(({ Icon, title, description }, index) => (
        <div className="trust-item" key={title}>
          <span className="trust-number">0{index + 1}</span>
          <h3>
            <Icon size={17} />
            {title}
          </h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}

function QuickStart() {
  const { locale } = useSite();
  const copy = getCopy(locale).docs;
  const command = `git clone ${REPOSITORY_URL}.git\ncd belfry-desktop-plugins\n\npython3 scripts/new_plugin.py myteam.notes \\\n  --name "My Notes" --author "Your Name" --template panel-basic\n\npython3 scripts/check_plugin.py plugins/myteam.notes\npython3 scripts/pack_plugin.py plugins/myteam.notes\npython3 scripts/rebuild_catalog.py\npython3 scripts/rebuild_catalog.py --check`;
  return (
    <>
      <h2>{copy.quickStart}</h2>
      <pre>
        <code>{command}</code>
      </pre>
      <p>
        {locale === "zh-CN"
          ? "manifest.json 会自动生成。你只需要修改 main.js 和面板页面；增加能力时，再同步声明所需权限。"
          : "The manifest is generated for you. Edit main.js and the panel; declare additional permissions when adding capabilities."}
      </p>
      <h2>{locale === "zh-CN" ? "选择起点" : "Choose a starting point"}</h2>
      <ul>
        <li>
          <code>panel-basic</code> —{" "}
          {locale === "zh-CN"
            ? "可保存便笺的面板"
            : "A panel with persistent notes"}
        </li>
        <li>
          <code>agent-tool-basic</code> —{" "}
          {locale === "zh-CN"
            ? "Agent 可调用的文本统计工具"
            : "A text inspection tool for agents"}
        </li>
        <li>
          <code>skill-pack</code> —{" "}
          {locale === "zh-CN" ? "代码审查 Skill" : "A review Skill"}
        </li>
        <li>
          <code>full-demo</code> —{" "}
          {locale === "zh-CN"
            ? "面板、工具和 Skill 的组合"
            : "Panel, tool and Skill together"}
        </li>
      </ul>
    </>
  );
}

function PublishingGuide() {
  const { locale } = useSite();
  const copy = getCopy(locale).docs;
  return (
    <>
      <h2>{copy.localTitle}</h2>
      <p>{copy.localDescription}</p>
      <h2>{copy.qualityTitle}</h2>
      <ul>
        {copy.qualityItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>{copy.submitTitle}</h2>
      <p>{copy.submitDescription}</p>
      <p>
        {locale === "zh-CN"
          ? "修改插件时提高 version，再打包和重建目录。已发布版本保留原文件；旧版本不能被另一份内容覆盖。"
          : "Increase version before packaging an update. Published files are immutable and earlier versions remain available."}
      </p>
      <p>
        <a
          className="button primary-button"
          href={`${REPOSITORY_URL}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer"
        >
          {copy.readGuide}
          <ArrowUpRight size={15} />
        </a>
      </p>
      <h2>{locale === "zh-CN" ? "连接插件市场" : "Connect the marketplace"}</h2>
      <MarketConnect />
    </>
  );
}

export function DeveloperGuide() {
  const { locale } = useSite();
  const copy = getCopy(locale).docs;
  return (
    <main className="page-shell">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="page-heading">
          <div>
            <p className="section-kicker">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
        </div>
        <GuideSteps />
        <article className="detail-content">
          <QuickStart />
          <PublishingGuide />
        </article>
      </div>
    </main>
  );
}
