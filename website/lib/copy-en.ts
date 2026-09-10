import type { SiteCopy } from "./copy-types";

export const english: SiteCopy = {
  nav: {
    browse: "Browse plugins",
    build: "Build a plugin",
    github: "GitHub",
    language: "Language",
  },
  footer: {
    description: "Open plugins, built for your Belfry workspace.",
    marketplace: "Marketplace",
    contributing: "Contributing",
    source: "Source code",
  },
  home: {
    eyebrow: "Belfry extension catalog",
    titlePrefix: "Make your workspace",
    titleAccent: "more capable.",
    description:
      "Tools, panels, skills and workflows for Belfry — built to stay close to your code and your machine.",
    browse: "Browse all plugins",
    build: "Build a plugin",
    note: "Open source packages · Explicit permissions · No account required",
    previewTitle: "Available in the catalog",
    previewReady: "available",
    previewNames: ["Git Lens", "Token Insights", "Todo List"],
    stats: [
      "plugins in the catalog",
      "ways to find your fit",
      "reviewable package source",
      "cloud accounts needed",
    ],
    startKicker: "Start here",
    startTitle: "Useful from the first session.",
    startDescription:
      "A small, focused catalog for the moments when your agent needs one more capability.",
    viewAll: "View all plugins",
    exploreKicker: "Explore by intent",
    exploreTitle: "Find the right kind of help.",
    trustKicker: "Designed for trust",
    trustTitle: "Keep the useful parts visible.",
    trustDescription:
      "Every plugin is inspectable before it enters your workspace. You decide what it can access.",
    trustItems: [
      {
        number: "01 / SOURCE",
        title: "Open package source",
        description:
          "Read the manifest, README and implementation before installing a package from the plugin repository.",
      },
      {
        number: "02 / PERMISSIONS",
        title: "Explicit capabilities",
        description:
          "Filesystem, network, shell and agent permissions are surfaced as part of the browse experience.",
      },
      {
        number: "03 / DELIVERY",
        title: "Simple package flow",
        description:
          "Download a versioned .piplug package, install it in Belfry, then review the host permission prompt.",
      },
    ],
    builderKicker: "For builders",
    builderTitle: "Build the extension your workflow is missing.",
    builderDescription:
      "The repository includes small examples and practical templates to help you go from idea to installable package.",
    builderButton: "Read the contribution guide",
  },
  categories: {
    all: { label: "All plugins", description: "Everything in the catalog." },
    productivity: {
      label: "Productivity",
      description: "Small tools that keep your work moving.",
    },
    "developer-tools": {
      label: "Developer tools",
      description: "Inspect, change and understand your codebase.",
    },
    community: {
      label: "Community",
      description: "Plugins built by the Belfry community.",
    },
    official: {
      label: "Official",
      description: "Maintained in the plugin repository.",
    },
    template: {
      label: "Templates",
      description: "Starting points for building your own plugin.",
    },
  },
  marketplace: {
    kicker: "The marketplace",
    title: "Browse plugins.",
    description:
      "Find small, focused extensions for your local Belfry workspace.",
    updated: "Catalog updated",
    searchPlaceholder: "Search by name, capability or category...",
    search: "Search",
    resultOne: "plugin",
    resultMany: "plugins",
    matching: "matching",
    packageNote: "Versioned .piplug packages",
    emptyTitle: "No plugins found.",
    emptyDescription: "Try another search or clear the category filter.",
  },
  detail: {
    plugins: "Plugins",
    official: "Official",
    by: "by",
    catalogOfficial: "Repository catalog",
    download: "Download .piplug",
    copyUrl: "Copy package URL",
    copied: "Copied",
    source: "View source",
    about: "About this plugin",
    noReadme:
      "No README is available yet. Visit the source repository for implementation details.",
    facts: "Plugin facts",
    latestVersion: "Latest version",
    requires: "Requires",
    packageSize: "Package size",
    published: "Published",
    category: "Category",
    permissions: "Permissions",
    noPermissions: "No permissions declared.",
    reviewTitle: "Review before installing",
    reviewDescription:
      "This plugin requests capabilities that may access your workspace, network or external applications.",
    safetyNotes: "Safety notes",
    installTitle: "Install in Belfry",
    installDescription:
      "Download the package, then open Settings → Plugins → Import plugin and review its permissions.",
    downloadPackage: "Download package",
  },
  docs: {
    home: "Home",
    kicker: "For builders",
    title: "Build a plugin.",
    description:
      "Belfry plugins are small, versioned packages that add tools, panels, skills and workflows to a local workspace.",
    quickStart: "Quick start",
    qualityTitle: "What makes a good plugin?",
    qualityItems: [
      "Clear README explaining what the plugin does and what it can access.",
      "Semantic versioning and a short changelog for every published version.",
      "A minimum permission set with plain-language safety notes.",
      "Localized panel titles when a plugin provides a UI panel.",
    ],
    submitTitle: "Submit to the catalog",
    submitDescription:
      "Follow the full contribution checklist in the repository. Once merged, the raw catalog and package become available to Belfry users.",
    readGuide: "Read CONTRIBUTING.md",
    localTitle: "Local verification",
    localDescription:
      "Load the development plugin in Belfry, confirm its commands and panels, inspect the permission behavior, then test the packaged .piplug artifact before opening a pull request.",
    templateTitle: "Start from a template",
    templateDescription:
      "Generate a panel, agent tool, Skill pack or full example with one command.",
    permissionTitle: "Request only what you need",
    permissionDescription:
      "Permissions are reviewed by users and should be kept as narrow as possible.",
    packageTitle: "Pack and publish",
    packageDescription:
      "Build a .piplug package, rebuild the catalog, then open a pull request.",
    sourceFirst:
      "The catalog is intentionally source-first: read the manifest and README before installing.",
  },
};
