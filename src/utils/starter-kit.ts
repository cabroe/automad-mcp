export interface StarterKitFile {
  path: string;
  type: 'file' | 'dir';
  description?: string;
}

export const STARTER_KIT_REPO = 'automadcms/automad-theme-starter-kit';
export const STARTER_KIT_BRANCH = 'master';
export const STARTER_KIT_RAW_BASE = `https://raw.githubusercontent.com/${STARTER_KIT_REPO}/${STARTER_KIT_BRANCH}`;
export const STARTER_KIT_HTML_BASE = `https://github.com/${STARTER_KIT_REPO}/blob/${STARTER_KIT_BRANCH}`;
export const STARTER_KIT_API_BASE = `https://api.github.com/repos/${STARTER_KIT_REPO}/contents`;

/**
 * Fetch file/folder listing from GitHub API.
 * Returns the contents of a directory or file metadata.
 */
export async function fetchStarterKitDir(path = ''): Promise<StarterKitFile[]> {
  const url = path ? `${STARTER_KIT_API_BASE}/${path}` : STARTER_KIT_API_BASE;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'automad-mcp/1.0',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as Array<{
    name: string;
    path: string;
    type: string;
  }>;

  return data.map(item => ({
    path: item.path,
    type: item.type as 'file' | 'dir',
    description: getDefaultDescription(item.path, item.type as 'file' | 'dir'),
  }));
}

/**
 * Get a human-readable description for common Starter Kit files.
 */
function getDefaultDescription(filePath: string, type: 'file' | 'dir'): string | undefined {
  if (type === 'dir') {
    const dirDescriptions: Record<string, string> = {
      blocks: 'Custom block templates for the Automad block editor',
      client: 'Frontend source: TypeScript and LESS files compiled by esbuild',
      components: 'PHP component partials – reusable template snippets included in page templates',
      i18n: 'Internationalization JSON files for multilingual dashboard labels',
      icons: 'SVG icon files used in the theme',
      lib: 'PHP utility/library files used by the theme',
      bin: 'Bash helper scripts for development',
    };
    const name = filePath.split('/').pop() ?? filePath;
    return dirDescriptions[name];
  }

  const fileDescriptions: Record<string, string> = {
    'README.md':
      'Full setup guide: prerequisites, dev server, theme structure, production build, deployment',
    'theme.json':
      'Theme metadata: name, description, author, templates, and field definitions for the dashboard',
    '.env.example':
      'Example environment file – set AUTOMAD_BASE to your Automad installation directory',
    'composer.json': 'PHP dependencies (automad/automad) and autoloader config',
    'package.json':
      'Node.js scripts (dev, build, format) and dependencies (esbuild, LESS, PostCSS, TypeScript)',
    'esbuild.js': 'Custom esbuild build script for bundling TypeScript and LESS',
    'postcss.config.js': 'PostCSS configuration for CSS processing',
    'tsconfig.json': 'TypeScript compiler configuration',
    '.editorconfig': 'Editor configuration for consistent code style',
    '.php-cs-fixer.php': 'PHP CS Fixer configuration for PHP code formatting',
    'default.php': 'Default page template – the main template for regular content pages',
    'pagelist.php':
      'Pagelist template – displays a filterable/sortable list of child pages with thumbnails',
    'page_not_found.php': '404 error page template',
    'blocks/pagelist/grid.php':
      'Grid layout template for pagelist block – renders page cards with image, title, excerpt',
    'bin/dev.sh':
      'Development start script – launches PHP dev server and esbuild watcher in parallel',
    'bin/server.sh': 'PHP built-in web server launcher helper',
  };

  return fileDescriptions[filePath];
}

/**
 * Hardcoded fallback for when GitHub API is unavailable.
 * This ensures the tool always works even without API access.
 */
export const STARTER_KIT_FILES_FALLBACK: StarterKitFile[] = [
  { path: 'README.md', type: 'file', description: 'Full setup guide' },
  { path: 'theme.json', type: 'file', description: 'Theme metadata and field definitions' },
  { path: '.env.example', type: 'file', description: 'Environment file template' },
  { path: 'composer.json', type: 'file', description: 'PHP dependencies' },
  { path: 'package.json', type: 'file', description: 'Node.js scripts and dependencies' },
  { path: 'esbuild.js', type: 'file', description: 'esbuild build script' },
  { path: 'postcss.config.js', type: 'file', description: 'PostCSS configuration' },
  { path: 'tsconfig.json', type: 'file', description: 'TypeScript configuration' },
  { path: '.editorconfig', type: 'file', description: 'Editor configuration' },
  { path: '.php-cs-fixer.php', type: 'file', description: 'PHP CS Fixer configuration' },
  { path: 'default.php', type: 'file', description: 'Default page template' },
  { path: 'pagelist.php', type: 'file', description: 'Pagelist template' },
  { path: 'page_not_found.php', type: 'file', description: '404 error page template' },
  { path: 'blocks', type: 'dir', description: 'Custom block templates' },
  { path: 'blocks/pagelist', type: 'dir', description: 'Pagelist block' },
  { path: 'blocks/pagelist/grid.php', type: 'file', description: 'Pagelist grid layout' },
  { path: 'client', type: 'dir', description: 'Frontend source files' },
  { path: 'components', type: 'dir', description: 'PHP component partials' },
  { path: 'i18n', type: 'dir', description: 'Internationalization files' },
  { path: 'icons', type: 'dir', description: 'SVG icons' },
  { path: 'lib', type: 'dir', description: 'PHP utilities' },
  { path: 'bin', type: 'dir', description: 'Bash scripts' },
  { path: 'bin/dev.sh', type: 'file', description: 'Dev server script' },
  { path: 'bin/server.sh', type: 'file', description: 'PHP server script' },
];

// Legacy export for backwards compatibility
export const STARTER_KIT_FILES = STARTER_KIT_FILES_FALLBACK;

export const READABLE_FILE_EXTENSIONS = new Set([
  '.php',
  '.js',
  '.ts',
  '.json',
  '.md',
  '.css',
  '.less',
  '.sh',
  '.txt',
  '.html',
  '.xml',
  '.yaml',
  '.yml',
  '.env',
]);
