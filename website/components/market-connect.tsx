"use client";

import { CATALOG_URL } from "../lib/catalog";
import { useSite } from "../lib/site-context";
import { CopyButton } from "./copy-button";

export function MarketConnect() {
  const { locale } = useSite();
  const chinese = locale === "zh-CN";
  return (
    <div className="market-connect">
      <CopyButton
        value={CATALOG_URL}
        label={chinese ? "复制市场地址" : "Copy catalog URL"}
      />
      <code>{CATALOG_URL}</code>
      <p className="safety-note">
        {chinese
          ? "在 Belfry 的插件市场选择“Belfry 插件中心 · GitHub”，或把地址填入“自有在线市场”。"
          : "Choose Belfry Plugins · GitHub in the app, or paste this URL into Custom online marketplace."}
      </p>
    </div>
  );
}
