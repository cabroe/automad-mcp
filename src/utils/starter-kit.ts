export interface StarterKitFile {
  path: string;
  type: "file" | "dir";
  description?: string;
}

export const STARTER_KIT_REPO = "automadcms/automad-theme-starter-kit";
export const STARTER_KIT_BRANCH = "master";
export const STARTER_KIT_RAW_BASE = `https://raw.githubusercontent.com/${STARTER_KIT_REPO}/${STARTER_KIT_BRANCH}`;
export const STARTER_KIT_HTML_BASE = `https://github.com/${STARTER_KIT_REPO}/blob/${STARTER_KIT_BRANCH}`;

/**
 * Known files in the Automad Theme Starter Kit.
 * Source: https://github.com/automadcms/automad-theme-starter-kit
 */
export const STARTER_KIT_FILES: StarterKitFile[] = [
  // Docs & Config
  { path: "README.md", type: "file", description: "Full setup guide: prerequisites, dev server, theme structure, production build, deployment" },
  { path: "theme.json", type: "file", description: "Theme metadata: name, description, author, templates, and field definitions for the dashboard" },
  { path: ".env.example", type: "file", description: "Example environment file – set AUTOMAD_BASE to your Automad installation directory" },
  { path: "composer.json", type: "file", description: "PHP dependencies (automad/automad) and autoloader config" },
  { path: "package.json", type: "file", description: "Node.js scripts (dev, build, format) and dependencies (esbuild, LESS, PostCSS, TypeScript)" },
  { path: "esbuild.js", type: "file", description: "Custom esbuild build script for bundling TypeScript and LESS" },
  { path: "postcss.config.js", type: "file", description: "PostCSS configuration for CSS processing" },
  { path: "tsconfig.json", type: "file", description: "TypeScript compiler configuration" },
  { path: ".editorconfig", type: "file", description: "Editor configuration for consistent code style" },
  { path: ".php-cs-fixer.php", type: "file", description: "PHP CS Fixer configuration for PHP code formatting" },

  // Templates (PHP)
  { path: "default.php", type: "file", description: "Default page template – the main template for regular content pages" },
  { path: "pagelist.php", type: "file", description: "Pagelist template – displays a filterable/sortable list of child pages with thumbnails" },
  { path: "page_not_found.php", type: "file", description: "404 error page template" },

  // Blocks
  { path: "blocks", type: "dir", description: "Custom block templates for the Automad block editor" },
  { path: "blocks/pagelist", type: "dir", description: "Pagelist block – grid layout for displaying page cards" },
  { path: "blocks/pagelist/grid.php", type: "file", description: "Grid layout template for pagelist block – renders page cards with image, title, excerpt" },

  // Client (TypeScript/LESS frontend)
  { path: "client", type: "dir", description: "Frontend source: TypeScript and LESS files compiled by esbuild" },

  // Components
  { path: "components", type: "dir", description: "PHP component partials – reusable template snippets included in page templates" },

  // i18n
  { path: "i18n", type: "dir", description: "Internationalization JSON files for multilingual dashboard labels" },

  // Icons
  { path: "icons", type: "dir", description: "SVG icon files used in the theme" },

  // Lib
  { path: "lib", type: "dir", description: "PHP utility/library files used by the theme" },

  // Bin scripts
  { path: "bin", type: "dir", description: "Bash helper scripts for development" },
  { path: "bin/dev.sh", type: "file", description: "Development start script – launches PHP dev server and esbuild watcher in parallel" },
  { path: "bin/server.sh", type: "file", description: "PHP built-in web server launcher helper" },
];

export const READABLE_FILE_EXTENSIONS = new Set([
  ".php", ".js", ".ts", ".json", ".md", ".css", ".less",
  ".sh", ".txt", ".html", ".xml", ".yaml", ".yml", ".env",
]);
