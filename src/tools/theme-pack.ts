import { z } from 'zod';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

export const themePackInputSchema = z.object({
  themePath: z.string().optional().describe('Theme directory'),
  outputPath: z.string().optional().describe('Output ZIP path'),
});

export type ThemePackInput = z.infer<typeof themePackInputSchema>;

/**
 * Pack a theme into a ZIP file for distribution
 */
export async function packTheme(input: ThemePackInput): Promise<string> {
  const { themePath, outputPath } = input;

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
    return '❌ Theme not found';
  }

  const themeJsonPath = join(themeDir, 'theme.json');
  if (!existsSync(themeJsonPath)) {
    return '❌ theme.json not found - not a valid theme';
  }

  const themeJson = JSON.parse(await readFile(themeJsonPath, 'utf-8'));
  const themeName = themeJson.name || 'theme';
  const safeName = themeName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const output = outputPath || join(dirname(themeDir), `${safeName}.zip`);

  const files = await getThemeFiles(themeDir);

  const lines: string[] = [
    '## Theme Package Info\n',
    `**Theme:** ${themeJson.name}`,
    `**Version:** ${themeJson.version || '1.0.0'}`,
    `**Author:** ${themeJson.author || 'Unknown'}`,
    `**Output:** ${output}`,
    '',
    '### Files to include (' + files.length + ')\n',
  ];

  for (const file of files.slice(0, 30)) {
    lines.push(`- ${file}`);
  }
  if (files.length > 30) lines.push(`- ... and ${files.length - 30} more`);

  lines.push('\n---\n');
  lines.push('### Installation\n');
  lines.push('```bash');
  lines.push(`php amd install ${output}`);
  lines.push('# Or upload via Dashboard > Packages\n');
  lines.push('```\n');

  // Note: Actual ZIP creation would require the archiver package
  // For now, return instructions
  lines.push('### Manual packaging\n');
  lines.push('```bash');
  lines.push(`cd ${themeDir}`);
  lines.push('zip -r ' + output + ' .');
  lines.push('```');

  return lines.join('\n');
}

async function getThemeFiles(dir: string, prefix = ''): Promise<string[]> {
  const files: string[] = [];

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'cache') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getThemeFiles(fullPath, prefix + entry.name + '/')));
    } else {
      files.push(prefix + entry.name);
    }
  }

  return files;
}
