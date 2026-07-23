import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const themeAnalyzerInputSchema = z.object({
  themePath: z.string().optional().describe('Path to theme'),
});

export type ThemeAnalyzerInput = z.infer<typeof themeAnalyzerInputSchema>;

interface ThemeFile {
  path: string;
  type: 'template' | 'component' | 'asset' | 'config';
  size: number;
}

/**
 * Analyze and visualize theme structure
 */
export async function analyzeTheme(input: ThemeAnalyzerInput): Promise<string> {
  const { themePath } = input;

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

  const files = await scanTheme(themeDir);

  // Group by type
  const templates = files.filter(f => f.type === 'template');
  const components = files.filter(f => f.type === 'component');
  const assets = files.filter(f => f.type === 'asset');
  const configs = files.filter(f => f.type === 'config');

  const lines: string[] = [
    '## Theme Structure Analysis\n',
    `**Path:** ${themeDir}\n`,
    `---\n`,
    '### Overview\n',
    `| Type | Count |`,
    `|------|-------|`,
    `| Templates | ${templates.length} |`,
    `| Components | ${components.length} |`,
    `| Assets | ${assets.length} |`,
    `| Config | ${configs.length} |`,
    '',
  ];

  if (templates.length > 0) {
    lines.push('### Templates\n');
    lines.push('```');
    for (const t of templates) {
      lines.push(`${t.path} (${formatSize(t.size)})`);
    }
    lines.push('```\n');
  }

  if (components.length > 0) {
    lines.push('### Components\n');
    lines.push('```');
    for (const c of components) {
      lines.push(`${c.path} (${formatSize(c.size)})`);
    }
    lines.push('```\n');
  }

  // Check for common issues
  lines.push('### Health Checks\n');
  const issues = await checkThemeHealth(themeDir, files);
  for (const issue of issues) {
    lines.push(`- ${issue}`);
  }

  return lines.join('\n');
}

async function scanTheme(dir: string, prefix = ''): Promise<ThemeFile[]> {
  const files: ThemeFile[] = [];

  if (!existsSync(dir)) return files;

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'cache') continue;

    const fullPath = join(dir, entry.name);
    const relPath = prefix + entry.name;

    if (entry.isDirectory()) {
      files.push(...(await scanTheme(fullPath, relPath + '/')));
    } else {
      const stat = await readFile(fullPath).catch(() => Buffer.alloc(0));
      const ext = entry.name.split('.').pop()?.toLowerCase() || '';

      let type: ThemeFile['type'] = 'asset';
      if (['php'].includes(ext)) {
        type = relPath.includes('/components/') ? 'component' : 'template';
      } else if (['json', 'yaml', 'yml'].includes(ext)) {
        type = 'config';
      } else if (['css', 'less', 'scss', 'js', 'ts', 'svg', 'png', 'jpg'].includes(ext)) {
        type = 'asset';
      }

      files.push({ path: relPath, type, size: stat.length });
    }
  }

  return files;
}

async function checkThemeHealth(dir: string, files: ThemeFile[]): Promise<string[]> {
  const issues: string[] = [];

  // Check for theme.json
  if (!files.find(f => f.path === 'theme.json')) {
    issues.push('⚠️ No theme.json found');
  } else {
    issues.push('✅ theme.json present');
  }

  // Check for default.php
  if (!files.find(f => f.path === 'default.php')) {
    issues.push('⚠️ No default.php template found');
  } else {
    issues.push('✅ default.php present');
  }

  // Check for components directory
  if (!files.find(f => f.path.startsWith('components/'))) {
    issues.push('ℹ️ No components directory');
  } else {
    issues.push('✅ Components directory present');
  }

  return issues;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
