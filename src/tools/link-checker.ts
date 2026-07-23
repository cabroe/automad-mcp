import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const linkCheckerInputSchema = z.object({
  themePath: z.string().optional().describe('Path to theme'),
  baseUrl: z.string().optional().default('/').describe('Base URL for internal links'),
});

export type LinkCheckerInput = z.infer<typeof linkCheckerInputSchema>;

interface Link {
  url: string;
  file: string;
  line: number;
  type: 'internal' | 'external' | 'anchor';
}

/**
 * Check for broken internal links in templates
 */
export async function checkBrokenLinks(input: LinkCheckerInput): Promise<string> {
  const { themePath, baseUrl } = input;

  const searchPaths = themePath
    ? [themePath]
    : [join(process.cwd(), 'packages', 'hangdrang', 'automad-theme-hangdrang'), process.cwd()];

  let themeDir: string | null = null;
  for (const p of searchPaths) {
    if (existsSync(p)) {
      themeDir = p;
      break;
    }
  }

  if (!themeDir) {
    return '❌ Theme not found. Provide themePath.';
  }

  const links: Link[] = [];
  const phpFiles = await getPhpFiles(themeDir);

  for (const file of phpFiles) {
    const content = await readFile(join(themeDir, file), 'utf-8').catch(() => '');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Find href attributes
      const hrefMatches = line.matchAll(/href\s*=\s*["']([^"']+)["']/g);
      for (const match of hrefMatches) {
        links.push({
          url: match[1],
          file,
          line: idx + 1,
          type: classifyLink(match[1], baseUrl),
        });
      }

      // Find url variables
      const urlMatches = [...line.matchAll(/@{:\s*url\s*}/g)];
      if (urlMatches.length > 0) {
        links.push({
          url: ':url (runtime)',
          file,
          line: idx + 1,
          type: 'internal',
        });
      }

      // Find with @{ url } patterns
      const withMatches = line.matchAll(/<@\s*with\s+['"]([^'"]+)['"]\s*@>.*@{:\s*url\s*}/g);
      for (const match of withMatches) {
        links.push({
          url: `${match[1]} (via with)`,
          file,
          line: idx + 1,
          type: 'internal',
        });
      }
    });
  }

  // Check for common issues
  const issues: string[] = [];

  // Check for hardcoded paths
  const hardcodedPaths = links.filter(
    l =>
      l.type === 'internal' &&
      !l.url.startsWith('/') &&
      !l.url.startsWith(':') &&
      !l.url.includes('http')
  );

  if (hardcodedPaths.length > 0) {
    issues.push(`⚠️ ${hardcodedPaths.length} relative paths found (use absolute paths)`);
    for (const link of hardcodedPaths.slice(0, 5)) {
      issues.push(`  - ${link.file}:${link.line}: ${link.url}`);
    }
  }

  // Check for deprecated patterns
  const deprecatedPatterns = links.filter(
    l => l.url.includes('index.php') || l.url.includes('?page=')
  );

  if (deprecatedPatterns.length > 0) {
    issues.push(`⚠️ ${deprecatedPatterns.length} deprecated URL patterns found`);
  }

  const lines: string[] = ['## Link Analysis\n'];

  lines.push(`**Total links:** ${links.length}\n`);
  lines.push(`| Type | Count |`);
  lines.push(`|------|-------|`);
  lines.push(`| Internal | ${links.filter(l => l.type === 'internal').length} |`);
  lines.push(`| External | ${links.filter(l => l.type === 'external').length} |`);
  lines.push(`| Runtime | ${links.filter(l => l.url.includes(':url')).length} |`);

  if (issues.length > 0) {
    lines.push('\n### Issues\n');
    for (const issue of issues) {
      lines.push(`- ${issue}`);
    }
  } else {
    lines.push('\n✅ No obvious link issues found!');
  }

  lines.push('\n### Internal Links\n');
  const internalLinks = links.filter(l => l.type === 'internal' && !l.url.includes(':url'));
  for (const link of internalLinks.slice(0, 20)) {
    lines.push(`- ${link.file}:${link.line}: ${link.url}`);
  }

  return lines.join('\n');
}

function classifyLink(url: string, _baseUrl: string): Link['type'] {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'external';
  }
  if (url.startsWith('#')) {
    return 'anchor';
  }
  return 'internal';
}

async function getPhpFiles(dir: string, prefix = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getPhpFiles(fullPath, prefix + entry.name + '/')));
    } else if (entry.name.endsWith('.php')) {
      files.push(prefix + entry.name);
    }
  }

  return files;
}
