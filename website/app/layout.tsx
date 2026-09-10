import type { Metadata } from "next";
import { SiteProvider } from "../lib/site-context";
import { SiteFooter, SiteHeader } from "../components/site-header";
import { sitePath } from "../lib/paths";
import "./globals.css";
import "./additions.css";

export const metadata: Metadata = {
  icons: { icon: sitePath("/favicon.svg") },
  title: {
    default: "Belfry Plugins — 插件中心",
    template: "%s — Belfry Plugins",
  },
  description:
    "Belfry 的开源插件中心。浏览工具、面板和 Skill，从模板制作并分享自己的插件。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SiteProvider>
      </body>
    </html>
  );
}
