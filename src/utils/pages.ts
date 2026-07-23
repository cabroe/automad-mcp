export interface DocPage {
  title: string;
  url: string;
  parent: string;
  section: string;
}

/**
 * Full index of all Automad documentation pages.
 * Sourced from the autocomplete data embedded in automad.org.
 */
export const PAGES: DocPage[] = [
  // Root
  { title: "Automad", url: "/", parent: "", section: "root" },

  // Getting Started
  { title: "Getting Started", url: "/getting-started", parent: "Automad", section: "getting-started" },
  { title: "Local Installation", url: "/getting-started/local-installation", parent: "Getting Started", section: "getting-started" },
  { title: "System Requirements", url: "/getting-started/system-requirements", parent: "Getting Started", section: "getting-started" },
  { title: "Terms of Use", url: "/getting-started/terms-of-use", parent: "Getting Started", section: "getting-started" },

  // System
  { title: "System", url: "/system", parent: "Automad", section: "system" },
  { title: "Allowed File Types", url: "/system/allowed-file-types", parent: "System", section: "system" },
  { title: "Caching", url: "/system/caching", parent: "System", section: "system" },
  { title: "Console", url: "/system/console", parent: "System", section: "system" },
  { title: "Debugging", url: "/system/debugging", parent: "System", section: "system" },
  { title: "Installing Packages", url: "/system/installing-packages", parent: "System", section: "system" },
  { title: "Language", url: "/system/language", parent: "System", section: "system" },
  { title: "RSS Feed", url: "/system/rss-feed", parent: "System", section: "system" },
  { title: "Securing the Dashboard", url: "/system/securing-the-dashboard", parent: "System", section: "system" },
  { title: "sitemap.xml", url: "/system/sitemap-xml", parent: "System", section: "system" },
  { title: "Updating Automad", url: "/system/updating-automad", parent: "System", section: "system" },
  { title: "Users", url: "/system/users", parent: "System", section: "system" },

  // User Guide
  { title: "User Guide", url: "/user-guide", parent: "Automad", section: "user-guide" },
  { title: "Creating Pages", url: "/user-guide/creating-pages", parent: "User Guide", section: "user-guide" },
  { title: "General Data and Files", url: "/user-guide/general-data-and-files", parent: "User Guide", section: "user-guide" },
  { title: "Key-Combos", url: "/user-guide/key-combos", parent: "User Guide", section: "user-guide" },
  { title: "Linking to Files and Pages", url: "/user-guide/linking-to-files-and-pages", parent: "User Guide", section: "user-guide" },
  { title: "Resizing Images", url: "/user-guide/resizing-images", parent: "User Guide", section: "user-guide" },
  { title: "Using Blocks", url: "/user-guide/using-blocks", parent: "User Guide", section: "user-guide" },

  // Developer Guide – Overview
  { title: "Developer Guide", url: "/developer-guide", parent: "Automad", section: "developer-guide" },
  { title: "API Reference", url: "/developer-guide/api-reference", parent: "Developer Guide", section: "developer-guide" },
  { title: "Editor Plugins", url: "/developer-guide/editor-plugins", parent: "Developer Guide", section: "developer-guide" },
  { title: "Publishing Packages", url: "/developer-guide/publishing-packages", parent: "Developer Guide", section: "developer-guide" },

  // Developer Guide – Building Themes
  { title: "Building Themes", url: "/developer-guide/building-themes", parent: "Developer Guide", section: "developer-guide" },
  { title: "Block Layouts", url: "/developer-guide/building-themes/block-layouts", parent: "Building Themes", section: "developer-guide" },
  { title: "Customizing Blocks", url: "/developer-guide/building-themes/customizing-blocks", parent: "Building Themes", section: "developer-guide" },
  { title: "Plain PHP", url: "/developer-guide/building-themes/plain-php", parent: "Building Themes", section: "developer-guide" },
  { title: "theme.json", url: "/developer-guide/building-themes/theme-json", parent: "Building Themes", section: "developer-guide" },

  // Developer Guide – Template Language
  { title: "Template Language", url: "/developer-guide/building-themes/template-language", parent: "Building Themes", section: "developer-guide" },
  { title: "Control Structures", url: "/developer-guide/building-themes/template-language/control-structures", parent: "Template Language", section: "developer-guide" },
  { title: "for", url: "/developer-guide/building-themes/template-language/control-structures/for", parent: "Control Structures", section: "developer-guide" },
  { title: "foreach", url: "/developer-guide/building-themes/template-language/control-structures/foreach", parent: "Control Structures", section: "developer-guide" },
  { title: "if", url: "/developer-guide/building-themes/template-language/control-structures/if", parent: "Control Structures", section: "developer-guide" },
  { title: "with", url: "/developer-guide/building-themes/template-language/control-structures/with", parent: "Control Structures", section: "developer-guide" },
  { title: "Includes", url: "/developer-guide/building-themes/template-language/includes", parent: "Template Language", section: "developer-guide" },
  { title: "Inheritance", url: "/developer-guide/building-themes/template-language/inheritance", parent: "Template Language", section: "developer-guide" },
  { title: "Multilingual Content", url: "/developer-guide/building-themes/template-language/multilingual-content", parent: "Template Language", section: "developer-guide" },
  { title: "Recursive Navigations", url: "/developer-guide/building-themes/template-language/recursive-navigations", parent: "Template Language", section: "developer-guide" },
  { title: "Snippets", url: "/developer-guide/building-themes/template-language/snippets", parent: "Template Language", section: "developer-guide" },
  { title: "Working with Images", url: "/developer-guide/building-themes/template-language/working-with-images", parent: "Template Language", section: "developer-guide" },
  { title: "Using Extensions", url: "/developer-guide/building-themes/template-language/using-extensions", parent: "Template Language", section: "developer-guide" },

  // Developer Guide – Objects
  { title: "Objects", url: "/developer-guide/building-themes/template-language/objects", parent: "Template Language", section: "developer-guide" },
  { title: "Filelist", url: "/developer-guide/building-themes/template-language/objects/filelist", parent: "Objects", section: "developer-guide" },
  { title: "Filters", url: "/developer-guide/building-themes/template-language/objects/filters", parent: "Objects", section: "developer-guide" },
  { title: "Pagelist", url: "/developer-guide/building-themes/template-language/objects/pagelist", parent: "Objects", section: "developer-guide" },
  { title: "Tags", url: "/developer-guide/building-themes/template-language/objects/tags", parent: "Objects", section: "developer-guide" },

  // Developer Guide – Variables
  { title: "Variables", url: "/developer-guide/building-themes/template-language/variables", parent: "Template Language", section: "developer-guide" },
  { title: "Reserved Variables", url: "/developer-guide/building-themes/template-language/variables/reserved-variables", parent: "Variables", section: "developer-guide" },
  { title: "Runtime Variables", url: "/developer-guide/building-themes/template-language/variables/runtime-variables", parent: "Variables", section: "developer-guide" },

  // Developer Guide – Pipe
  { title: "Pipe", url: "/developer-guide/building-themes/template-language/pipe", parent: "Template Language", section: "developer-guide" },
  { title: "ceil", url: "/developer-guide/building-themes/template-language/pipe/ceil", parent: "Pipe", section: "developer-guide" },
  { title: "dateFormat", url: "/developer-guide/building-themes/template-language/pipe/dateformat", parent: "Pipe", section: "developer-guide" },
  { title: "def", url: "/developer-guide/building-themes/template-language/pipe/def", parent: "Pipe", section: "developer-guide" },
  { title: "escape", url: "/developer-guide/building-themes/template-language/pipe/escape", parent: "Pipe", section: "developer-guide" },
  { title: "findFirstImage", url: "/developer-guide/building-themes/template-language/pipe/findfirstimage", parent: "Pipe", section: "developer-guide" },
  { title: "findFirstParagraph", url: "/developer-guide/building-themes/template-language/pipe/findfirstparagraph", parent: "Pipe", section: "developer-guide" },
  { title: "floor", url: "/developer-guide/building-themes/template-language/pipe/floor", parent: "Pipe", section: "developer-guide" },
  { title: "markdown", url: "/developer-guide/building-themes/template-language/pipe/markdown", parent: "Pipe", section: "developer-guide" },
  { title: "match", url: "/developer-guide/building-themes/template-language/pipe/match", parent: "Pipe", section: "developer-guide" },
  { title: "replace", url: "/developer-guide/building-themes/template-language/pipe/replace", parent: "Pipe", section: "developer-guide" },
  { title: "round", url: "/developer-guide/building-themes/template-language/pipe/round", parent: "Pipe", section: "developer-guide" },
  { title: "sanitize", url: "/developer-guide/building-themes/template-language/pipe/sanitize", parent: "Pipe", section: "developer-guide" },
  { title: "shorten", url: "/developer-guide/building-themes/template-language/pipe/shorten", parent: "Pipe", section: "developer-guide" },
  { title: "stripEnd", url: "/developer-guide/building-themes/template-language/pipe/stripend", parent: "Pipe", section: "developer-guide" },
  { title: "stripStart", url: "/developer-guide/building-themes/template-language/pipe/stripstart", parent: "Pipe", section: "developer-guide" },
  { title: "stripTags", url: "/developer-guide/building-themes/template-language/pipe/striptags", parent: "Pipe", section: "developer-guide" },
  { title: "strlen", url: "/developer-guide/building-themes/template-language/pipe/strlen", parent: "Pipe", section: "developer-guide" },
  { title: "strtolower", url: "/developer-guide/building-themes/template-language/pipe/strtolower", parent: "Pipe", section: "developer-guide" },
  { title: "strtoupper", url: "/developer-guide/building-themes/template-language/pipe/strtoupper", parent: "Pipe", section: "developer-guide" },
  { title: "ucwords", url: "/developer-guide/building-themes/template-language/pipe/ucwords", parent: "Pipe", section: "developer-guide" },

  // Developer Guide – Toolbox
  { title: "Toolbox", url: "/developer-guide/building-themes/template-language/toolbox", parent: "Template Language", section: "developer-guide" },
  { title: "breadcrumbs", url: "/developer-guide/building-themes/template-language/toolbox/breadcrumbs", parent: "Toolbox", section: "developer-guide" },
  { title: "filelist", url: "/developer-guide/building-themes/template-language/toolbox/filelist", parent: "Toolbox", section: "developer-guide" },
  { title: "img", url: "/developer-guide/building-themes/template-language/toolbox/img", parent: "Toolbox", section: "developer-guide" },
  { title: "nav", url: "/developer-guide/building-themes/template-language/toolbox/nav", parent: "Toolbox", section: "developer-guide" },
  { title: "navChildren", url: "/developer-guide/building-themes/template-language/toolbox/navchildren", parent: "Toolbox", section: "developer-guide" },
  { title: "navSiblings", url: "/developer-guide/building-themes/template-language/toolbox/navsiblings", parent: "Toolbox", section: "developer-guide" },
  { title: "navTop", url: "/developer-guide/building-themes/template-language/toolbox/navtop", parent: "Toolbox", section: "developer-guide" },
  { title: "navTree", url: "/developer-guide/building-themes/template-language/toolbox/navtree", parent: "Toolbox", section: "developer-guide" },
  { title: "newPagelist", url: "/developer-guide/building-themes/template-language/toolbox/newpagelist", parent: "Toolbox", section: "developer-guide" },
  { title: "pagelist", url: "/developer-guide/building-themes/template-language/toolbox/pagelist", parent: "Toolbox", section: "developer-guide" },
  { title: "queryStringMerge", url: "/developer-guide/building-themes/template-language/toolbox/querystringmerge", parent: "Toolbox", section: "developer-guide" },
  { title: "redirect", url: "/developer-guide/building-themes/template-language/toolbox/redirect", parent: "Toolbox", section: "developer-guide" },
  { title: "set", url: "/developer-guide/building-themes/template-language/toolbox/set", parent: "Toolbox", section: "developer-guide" },

  // Developer Guide – Extensions
  { title: "Developing Extensions", url: "/developer-guide/developing-extensions", parent: "Developer Guide", section: "developer-guide" },
  { title: "Custom Pipe Functions", url: "/developer-guide/developing-extensions/custom-pipe-functions", parent: "Developing Extensions", section: "developer-guide" },
  { title: "Generic Extensions", url: "/developer-guide/developing-extensions/generic-extensions", parent: "Developing Extensions", section: "developer-guide" },

  // Developer Guide – Cheat Sheets
  { title: "Cheat Sheets", url: "/developer-guide/cheat-sheets", parent: "Developer Guide", section: "developer-guide" },
  { title: "Creating Theme Packages", url: "/developer-guide/cheat-sheets/creating-theme-packages", parent: "Cheat Sheets", section: "developer-guide" },
  { title: "Plain PHP Snippets", url: "/developer-guide/cheat-sheets/plain-php-snippets", parent: "Cheat Sheets", section: "developer-guide" },
  { title: "Useful Template Snippets", url: "/developer-guide/cheat-sheets/useful-template-snippets", parent: "Cheat Sheets", section: "developer-guide" },

  // Headless Mode
  { title: "Headless Mode", url: "/headless-mode", parent: "Automad", section: "headless-mode" },
];

export const BASE_URL = "https://automad.org";

export const SECTIONS = [
  "getting-started",
  "system",
  "user-guide",
  "developer-guide",
  "headless-mode",
] as const;

export type Section = (typeof SECTIONS)[number];
