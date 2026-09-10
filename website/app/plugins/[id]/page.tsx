import { notFound } from "next/navigation";
import { catalog } from "../../../lib/catalog";
import { PluginDetail } from "../../../components/plugin-detail";

export const dynamicParams = false;
export function generateStaticParams() {
  return catalog.plugins.map((plugin) => ({ id: plugin.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plugin = catalog.plugins.find((entry) => entry.id === id);
  return {
    title: plugin?.name ?? "插件不存在",
    description: plugin?.description,
  };
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plugin = catalog.plugins.find((entry) => entry.id === id);
  if (!plugin) notFound();
  return <PluginDetail plugin={plugin} />;
}
