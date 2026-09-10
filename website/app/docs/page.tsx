import type { Metadata } from "next";
import { DeveloperGuide } from "../../components/developer-guide";

export const metadata: Metadata = { title: "开发插件" };
export default function DocsPage() {
  return <DeveloperGuide />;
}
