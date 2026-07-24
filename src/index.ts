import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { SECTIONS } from './utils/pages.js';
import { listPages } from './tools/list-pages.js';
import { searchDocs } from './tools/search.js';
import { getPage } from './tools/get-page.js';
import { listStarterKitFiles } from './tools/list-starter-kit-files.js';
import { getStarterKitFile } from './tools/get-starter-kit-file.js';
import { getThemeDoc } from './tools/get-theme-doc.js';
import { getSnippets } from './tools/snippets.js';
import { getBlockLayouts } from './tools/block-layouts.js';
import { validateTheme } from './tools/theme-validator.js';
import { analyzeFields } from './tools/field-analyzer.js';
import { compareThemes } from './tools/theme-compare.js';
import { generateTheme } from './tools/theme-generator.js';
import { generateI18n } from './tools/i18n-generator.js';
import { livePreview } from './tools/live-preview.js';
import { getBlockTemplates, getBlockTemplate } from './tools/block-templates.js';
import { getContextPatterns } from './tools/context-patterns.js';
import { getTemplateSyntax } from './tools/template-syntax.js';
import { getBlockDocs } from './tools/block-docs.js';
import { getApiDocs } from './tools/api-docs.js';
import { getCliDocs } from './tools/cli-docs.js';
import { themeCheck } from './tools/theme-checks.js';
import { generateCode } from './tools/code-generator.js';
import { themeDiff } from './tools/theme-diff.js';
import { packTheme } from './tools/theme-pack.js';
import { analyzeTheme } from './tools/theme-analyzer.js';
import { findThemeIssues } from './tools/theme-issues.js';
import { listFieldTypes } from './tools/field-types.js';
import { generateDashboardTemplate } from './tools/dashboard-generator.js';
import { i18nHelper } from './tools/i18n-helper.js';
import { validateFieldNames } from './tools/field-validator.js';
import { checkBrokenLinks } from './tools/link-checker.js';
import { getThemeReference } from './tools/theme-references.js';
import { getThemeAsset } from './tools/theme-assets.js';
import { getCacheStats, clearAllCaches, clearCache } from './utils/cache.js';
import { loadConfig, parseArgs, logVerbose } from './utils/config.js';

// ─── Parse CLI Args ──────────────────────────────────────────────────────────
const { config: cliConfig } = parseArgs(process.argv.slice(2));
loadConfig().then(() => {
  logVerbose('Config loaded');
  logVerbose(`Verbose mode: ${cliConfig.verbose ? 'on' : 'off'}`);
});

// ─── MCP Server ─────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'automad-docs',
  version: '0.0.1',
});

// ─── Documentation Tools ─────────────────────────────────────────────────────

server.tool(
  'list_pages',
  'List all available Automad documentation pages.',
  {
    section: z
      .enum(SECTIONS)
      .optional()
      .describe(`Filter by section: ${SECTIONS.join(', ')}`),
  },
  async args => {
    const result = listPages({ section: args.section });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'search_docs',
  'Search the Automad documentation index.',
  {
    query: z.string().min(1).describe('Search term'),
    page: z.number().int().min(1).default(1).optional().describe('Page number'),
    perPage: z.number().int().min(1).max(50).default(10).optional().describe('Results per page'),
  },
  async args => {
    const result = searchDocs({ query: args.query, page: args.page, perPage: args.perPage });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_page',
  'Fetch a documentation page as Markdown.',
  {
    url: z.string().min(1).describe('Page URL (full or relative)'),
  },
  async args => {
    try {
      const result = await getPage({ url: args.url });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: formatError('page', args.url, (err as Error).message) }],
        isError: true,
      };
    }
  }
);

server.tool(
  'list_starter_kit_files',
  'List files in the Automad Theme Starter Kit.',
  {
    directory: z.string().optional().describe('Filter by directory'),
  },
  async args => {
    const result = listStarterKitFiles({ directory: args.directory });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_starter_kit_file',
  'Read a file from the Automad Theme Starter Kit.',
  {
    path: z.string().min(1).optional().describe('File path'),
    file: z.string().min(1).optional().describe('Alias for path'),
  },
  async args => {
    try {
      const result = await getStarterKitFile({ path: args.path ?? args.file ?? '' });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [
          {
            type: 'text',
            text: formatError('file', args.path ?? args.file ?? '', (err as Error).message),
          },
        ],
        isError: true,
      };
    }
  }
);

// ─── Local Theme Tools ───────────────────────────────────────────────────────

server.tool(
  'get_theme_doc',
  'Read documentation from a local Automad theme.',
  {
    path: z.string().optional().describe("Path within theme (e.g., 'components/page.php')"),
    themePath: z.string().optional().describe('Absolute path to theme directory'),
  },
  async args => {
    try {
      const result = await getThemeDoc({ path: args.path, themePath: args.themePath });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'get_snippets',
  'Get reusable Automad template snippets. Categories: statements, variables, blocks, layout, i18n, navigation, helper',
  {
    category: z
      .enum(['all', 'statements', 'variables', 'blocks', 'layout', 'i18n', 'navigation', 'helper'])
      .optional()
      .default('all')
      .describe('Filter by category'),
    search: z.string().optional().describe('Search snippets'),
  },
  async args => {
    const result = getSnippets({
      category: args.category ?? 'all',
      search: args.search,
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_template_syntax',
  'Get comprehensive Automad template syntax reference. Explains the difference between statements (<@ @>), variables (@{ }), and blocks (@{ + }). Includes debugging tips.',
  {
    type: z
      .enum(['all', 'statements', 'variables', 'blocks', 'snippets', 'debug'])
      .optional()
      .default('all')
      .describe('Filter by type'),
  },
  async args => {
    const result = getTemplateSyntax({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_block_templates',
  'List available Automad block templates from the Starter Kit. Block templates customize how blocks (like pagelist) render in the editor.',
  {
    type: z
      .enum(['all', 'pagelist', 'sections'])
      .optional()
      .default('all')
      .describe('Block template type'),
  },
  async args => {
    try {
      const result = await getBlockTemplates({ type: args.type });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'get_block_template',
  'Fetch a specific block template from the Automad Starter Kit. Returns the raw PHP code for customization.',
  {
    type: z.string().min(1).describe("Block type (e.g., 'pagelist')"),
    variant: z.string().optional().describe("Variant name (e.g., 'grid', 'blog')"),
  },
  async args => {
    try {
      const result = await getBlockTemplate({ type: args.type, variant: args.variant });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'get_context_patterns',
  'Get Automad context manipulation patterns: set (mutate context), with (change context), foreach (loop variables), recursive (self-calling snippets for navigation).',
  {
    type: z
      .enum(['all', 'set', 'with', 'foreach', 'recursive'])
      .optional()
      .default('all')
      .describe('Context pattern type'),
  },
  async args => {
    const result = getContextPatterns({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_block_layouts',
  'Get block layout templates for the editor.',
  {
    type: z
      .enum(['all', 'hero', 'gallery', 'faq', 'team', 'pricing', 'testimonials', 'cta'])
      .optional()
      .default('all')
      .describe('Filter by type'),
  },
  async args => {
    const result = getBlockLayouts({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'validate_theme',
  'Validate a theme against Automad best practices.',
  {
    themePath: z.string().optional().describe('Absolute path to theme'),
  },
  async args => {
    try {
      const result = await validateTheme({ themePath: args.themePath });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'analyze_fields',
  'Analyze which fields are used in a theme.',
  {
    themePath: z.string().optional().describe('Theme path'),
    template: z.string().optional().describe('Specific template to analyze'),
  },
  async args => {
    try {
      const result = await analyzeFields({ themePath: args.themePath, template: args.template });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'compare_themes',
  'Compare a theme against the Starter Kit or another theme.',
  {
    baseTheme: z.string().optional().describe('Base theme path'),
    compareTheme: z.string().optional().describe('Theme to compare'),
    starterKitAsBase: z.boolean().optional().default(true).describe('Use Starter Kit as base'),
  },
  async args => {
    try {
      const result = await compareThemes({
        baseTheme: args.baseTheme,
        compareTheme: args.compareTheme,
        starterKitAsBase: args.starterKitAsBase,
      });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'generate_theme',
  'Generate a new Automad theme from template.',
  {
    name: z.string().optional().describe('Theme name'),
    outputPath: z.string().optional().describe('Output directory'),
    template: z
      .enum(['minimal', 'starter', 'blog', 'portfolio'])
      .optional()
      .default('starter')
      .describe('Template type'),
    author: z.string().optional().default('Developer').describe('Author name'),
  },
  async args => {
    try {
      const result = await generateTheme({
        name: args.name,
        outputPath: args.outputPath,
        template: args.template,
        author: args.author,
      });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'generate_i18n',
  "Generate translations, analyze templates, or explain i18n patterns. Use pattern='all' (default) to see pattern comparison, or specific pattern for detailed explanation.",
  {
    templatePath: z.string().optional().describe('Template file to scan'),
    themePath: z.string().optional().describe('Theme to scan'),
    generate: z.boolean().optional().default(false).describe('Generate i18n.php skeleton'),
    languages: z.string().optional().default('de,en').describe('Comma-separated languages'),
    pattern: z
      .enum(['all', 'per-tree', 'per-field', 'mixed'])
      .optional()
      .default('all')
      .describe('i18n pattern to explain'),
  },
  async args => {
    try {
      const result = await generateI18n({
        templatePath: args.templatePath,
        themePath: args.themePath,
        generate: args.generate,
        languages: args.languages,
        pattern: args.pattern,
      });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  'live_preview',
  'Manage local development server for theme preview.',
  {
    action: z
      .enum(['status', 'start', 'stop', 'open'])
      .optional()
      .default('status')
      .describe('Action'),
    port: z.number().int().min(1024).max(65535).optional().default(8000).describe('Server port'),
    themePath: z.string().optional().describe('Theme or Automad path'),
  },
  async args => {
    try {
      const result = await livePreview({
        action: args.action,
        port: args.port,
        themePath: args.themePath,
      });
      return { content: [{ type: 'text', text: result }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

// ─── Version & Info Tools ───────────────────────────────────────────────────

server.tool('get_automad_version', 'Get information about Automad v2.', {}, async () => {
  const lines = [
    '## Automad v2',
    '',
    '**Documentation:** [https://automad.org/version-2](https://automad.org/version-2)',
    '**Developer Guide:** [https://automad.org/developer-guide](https://automad.org/developer-guide)',
    '',
    '**Starter Kit:** [automad-theme-starter-kit](https://github.com/automadcms/automad-theme-starter-kit)',
  ];
  return { content: [{ type: 'text', text: lines.join('\n') }] };
});

// ─── Documentation Tools ─────────────────────────────────────────────────────

server.tool(
  'get_block_docs',
  'Get documentation for Automad v2 block types.',
  {
    type: z
      .enum([
        'all',
        'text',
        'image',
        'gallery',
        'pagelist',
        'section',
        'columns',
        'button',
        'quote',
        'code',
        'divider',
        'video',
        'embed',
        'rss-feed',
      ])
      .optional()
      .default('all')
      .describe('Block type'),
  },
  async args => {
    const result = getBlockDocs({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_api_docs',
  'Get API documentation (PHP, REST, Webhooks).',
  {
    type: z.enum(['all', 'php', 'rest', 'webhooks']).optional().default('all').describe('API type'),
  },
  async args => {
    const result = getApiDocs({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_cli_docs',
  'Get CLI command documentation.',
  {
    command: z.string().optional().describe('Specific command to document'),
  },
  async args => {
    const result = getCliDocs({ command: args.command });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Theme Checks ───────────────────────────────────────────────────────────

server.tool(
  'check_theme',
  'Perform theme checks (schema, a11y, seo).',
  {
    themePath: z.string().optional().describe('Theme path'),
    check: z
      .enum(['all', 'schema', 'a11y', 'seo'])
      .optional()
      .default('all')
      .describe('Check type'),
  },
  async args => {
    const result = await themeCheck({ themePath: args.themePath, check: args.check });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Code Generator ──────────────────────────────────────────────────────────

server.tool(
  'generate_code',
  'Generate common Automad template code (nav, pagelist, form).',
  {
    type: z.enum(['nav', 'pagelist', 'form']).describe('Code type'),
    style: z
      .enum(['simple', 'dropdown', 'tree', 'tabs', 'cards', 'masonry'])
      .optional()
      .default('simple')
      .describe('Style'),
  },
  async args => {
    const result = generateCode({ type: args.type, style: args.style });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Theme Utils ─────────────────────────────────────────────────────────────

server.tool(
  'compare_theme_versions',
  'Compare two themes or versions.',
  {
    path1: z.string().optional().describe('First theme path'),
    path2: z.string().optional().describe('Second theme path'),
    version: z.string().optional().describe('Compare with version tag'),
  },
  async args => {
    const result = await themeDiff({ path1: args.path1, path2: args.path2, version: args.version });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'pack_theme',
  'Get info for packaging a theme as ZIP.',
  {
    themePath: z.string().optional().describe('Theme path'),
    outputPath: z.string().optional().describe('Output ZIP path'),
  },
  async args => {
    const result = await packTheme({ themePath: args.themePath, outputPath: args.outputPath });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Theme Analysis ──────────────────────────────────────────────────────────

server.tool(
  'analyze_theme',
  'Analyze and visualize theme structure.',
  {
    themePath: z.string().optional().describe('Path to theme'),
  },
  async args => {
    const result = await analyzeTheme({ themePath: args.themePath });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'find_theme_issues',
  'Find Automad-specific issues in a theme.',
  {
    themePath: z.string().optional().describe('Path to theme'),
  },
  async args => {
    const result = await findThemeIssues({ themePath: args.themePath });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'list_field_types',
  'List all available Automad field types with widget mapping.',
  {
    type: z
      .enum(['all', 'widget', 'dashboard'])
      .optional()
      .default('all')
      .describe('Filter by type'),
  },
  async args => {
    const result = listFieldTypes({ type: args.type });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Dashboard Generator ─────────────────────────────────────────────────────

server.tool(
  'generate_dashboard_template',
  'Generate block layout templates for the dashboard.',
  {
    type: z
      .enum(['block-layout', 'pagelist-block', 'columns-block', 'section-block'])
      .describe('Block type'),
    name: z.string().optional().describe('Custom name'),
  },
  async args => {
    const result = generateDashboardTemplate({ type: args.type, name: args.name });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── I18n Tools ──────────────────────────────────────────────────────────────

server.tool(
  'check_i18n_consistency',
  'Check i18n consistency between languages.',
  {
    themePath: z.string().optional().describe('Path to theme'),
    lang: z.string().optional().default('de').describe('Language code'),
    action: z.enum(['check', 'extract', 'validate']).optional().default('check'),
  },
  async args => {
    const result = await i18nHelper({
      themePath: args.themePath,
      lang: args.lang,
      action: args.action,
    });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'validate_field_names',
  'Validate field names follow naming conventions.',
  {
    themePath: z.string().optional().describe('Path to theme'),
    style: z.enum(['camel', 'snake', 'both']).optional().default('snake').describe('Naming style'),
  },
  async args => {
    const result = await validateFieldNames({ themePath: args.themePath, style: args.style });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'check_broken_links',
  'Check for broken internal links in templates.',
  {
    themePath: z.string().optional().describe('Path to theme'),
    baseUrl: z.string().optional().default('/').describe('Base URL'),
  },
  async args => {
    const result = await checkBrokenLinks({ themePath: args.themePath, baseUrl: args.baseUrl });
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Theme Builder References (from automad-theme-builder skill) ───────────────

server.tool(
  'get_theme_reference',
  'Get Automad theme builder reference documentation. Topics: template-syntax, block-layouts, blocks-snippets, docker-testing, i18n.',
  {
    topic: z
      .enum([
        'all',
        'template-syntax',
        'block-layouts',
        'blocks-snippets',
        'docker-testing',
        'i18n',
      ])
      .optional()
      .default('all')
      .describe('Reference topic'),
  },
  async args => {
    const result = await getThemeReference(args.topic);
    return { content: [{ type: 'text', text: result }] };
  }
);

server.tool(
  'get_theme_asset',
  'Get Automad theme asset templates: theme.json.example, default.php.example, docker-compose.yml.example.',
  {
    type: z
      .enum(['all', 'theme.json.example', 'default.php.example', 'docker-compose.yml.example'])
      .optional()
      .default('all')
      .describe('Asset template type'),
  },
  async args => {
    const result = await getThemeAsset(args.type);
    return { content: [{ type: 'text', text: result }] };
  }
);

// ─── Cache Tools ─────────────────────────────────────────────────────────────

server.tool('get_cache_stats', 'Get cache statistics.', {}, async () => {
  const stats = getCacheStats();
  const lines = [
    '## Cache Statistics',
    '',
    `**Scraper:** ${stats.scraper.entries} entries, TTL ${formatMs(stats.scraper.ttlMs)}`,
    `**Starter Kit:** ${stats.starterKit.entries} entries, TTL ${formatMs(stats.starterKit.ttlMs)}`,
  ];
  return { content: [{ type: 'text', text: lines.join('\n') }] };
});

server.tool(
  'clear_cache',
  'Clear the internal cache.',
  {
    target: z
      .enum(['all', 'scraper', 'starterKit'])
      .optional()
      .default('all')
      .describe('Which cache to clear'),
  },
  async args => {
    const target = args.target ?? 'all';
    if (target === 'all') clearAllCaches();
    else clearCache(target);
    return { content: [{ type: 'text', text: `✅ Cache cleared: ${target}` }] };
  }
);

// ─── Health Check ────────────────────────────────────────────────────────────

server.tool('health', 'Health check endpoint.', {}, async () => {
  const mem = process.memoryUsage();
  const lines = [
    '## Health Check',
    '',
    '**Status:** ✅ Healthy',
    `**Uptime:** ${formatUptime(process.uptime())}`,
    `**Memory:** ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}`,
    `**Node.js:** ${process.version}`,
  ];
  return { content: [{ type: 'text', text: lines.join('\n') }] };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

function formatError(type: string, identifier: string, message: string): string {
  const lines = [`❌ **Error**\n`];
  if (message.includes('ECONNABORTED') || message.includes('timeout'))
    lines.push('**Timeout** — Request took too long.');
  else if (message.includes('404')) lines.push(`**Not Found:** ${identifier}`);
  else if (message.includes('429')) lines.push('**Rate Limited** — Wait and try again.');
  else if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED'))
    lines.push('**Connection Error** — Check internet.');
  else lines.push(message);
  return lines.join('\n');
}

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error('Automad MCP server running on stdio');
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', err);
  process.exit(1);
});
