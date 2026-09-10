import source from "../../catalog.json";
import config from "../../marketplace.json";
import { defaultLocale, type Locale } from "./i18n";
import { sitePath } from "./paths";

export type PluginVersion = {
  version: string;
  publishedAt: string;
  changelog?: string;
  minPiDesktop?: string;
  shasum: string;
  url: string;
  sizeBytes: number;
  permissions: string[];
  fs?: Record<string, unknown>;
  net?: Record<string, unknown>;
  yanked?: boolean;
};

export type Plugin = {
  id: string;
  name: string;
  description: string;
  author: string;
  categories: string[];
  verified?: boolean;
  repository: string;
  homepage?: string;
  readmeMarkdown: string;
  safetyNotes?: string;
  i18n?: Record<
    string,
    Partial<
      Pick<Plugin, "name" | "description" | "safetyNotes" | "readmeMarkdown">
    >
  >;
  versions: PluginVersion[];
};

export const catalog = source as { updatedAt: string; plugins: Plugin[] };
export const REPOSITORY_URL = `https://github.com/${config.repository}`;
export const CATALOG_URL = `https://raw.githubusercontent.com/${config.repository}/${config.branch}/catalog.json`;
export const featuredIds = config.featured;
export const featuredPlugins = featuredIds.flatMap((id) =>
  catalog.plugins.filter((plugin) => plugin.id === id),
);

export function localizedPlugin(plugin: Plugin, locale: Locale): Plugin {
  return {
    ...plugin,
    ...(plugin.i18n?.[locale] ?? plugin.i18n?.[defaultLocale] ?? {}),
  };
}

export function currentVersion(plugin: Plugin): PluginVersion {
  return (
    plugin.versions.find((version) => !version.yanked) ?? plugin.versions[0]
  );
}

export function packageUrl(plugin: Plugin): string {
  return sitePath(`/${currentVersion(plugin).url}`);
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function permissionRisk(permissions: string[] = []) {
  const highRisk = [
    "fs.write",
    "fs.delete",
    "fs.write.workspace",
    "fs.delete.workspace",
    "net.fetch",
    "shell.openExternal",
    "browser.cdp",
    "mcp.server.local",
  ];
  if (permissions.some((permission) => highRisk.includes(permission)))
    return { tone: "high" as const };
  if (
    permissions.some(
      (permission) =>
        permission.startsWith("agent.") || permission.startsWith("fs.read"),
    )
  )
    return { tone: "medium" as const };
  return { tone: "low" as const };
}

export function pluginSearchText(plugin: Plugin): string {
  return [
    plugin.id,
    plugin.name,
    plugin.description,
    plugin.author,
    ...plugin.categories,
  ]
    .join(" ")
    .toLowerCase();
}

export function sortPlugins(plugins: Plugin[]): Plugin[] {
  const rank = (id: string) => {
    const index = featuredIds.indexOf(id);
    return index < 0 ? featuredIds.length : index;
  };
  return [...plugins].sort(
    (a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name),
  );
}
