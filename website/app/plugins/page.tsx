import type { Metadata } from "next";
import { MarketPage } from "../../components/market-page";

export const metadata: Metadata = { title: "浏览插件" };
export default function PluginsPage() {
  return <MarketPage />;
}
