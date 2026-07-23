import { z } from 'zod';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const themeDiffInputSchema = z.object({
  path1: z.string().optional().describe('First theme path'),
  path2: z.string().optional().describe('Second theme path'),
  version: z.string().optional().describe('Compare with version tag (e.g., v1.0.0)'),
});

export type ThemeDiffInput = z.infer<typeof themeDiffInputSchema>;

/**
 * Compare two themes or theme versions
 */
export async function themeDiff(input: ThemeDiffInput): Promise<string> {
  const { path1, path2, version } = input;

  if (!path1 && !version) {
    return 'Provide either path1/path2 or a version tag to compare';
  }

  const lines: string[] = ['## Theme Comparison\n'];

  if (version) {
    lines.push(`Comparing with version: **${version}**\n`);
    lines.push('---\n');
    lines.push('### Changes since ' + version + '\n');
    lines.push('```diff');
    lines.push(`- Removed feature`);
    lines.push(`+ Added feature`);
    lines.push('```\n');
    lines.push('Note: Full diff requires git history or saved versions.');
  } else if (path1 && path2) {
    const files1 = await getFileTree(path1);
    const files2 = await getFileTree(path2);

    lines.push(`**Path 1:** ${path1}`);
    lines.push(`**Path 2:** ${path2}\n`);
    lines.push('---\n');

    const onlyIn1 = files1.filter(f => !files2.includes(f));
    const onlyIn2 = files2.filter(f => !files1.includes(f));
    const inBoth = files1.filter(f => files2.includes(f));

    if (onlyIn1.length > 0) {
      lines.push('### Only in Path 1\n');
      for (const f of onlyIn1) lines.push(`- ${f}`);
      lines.push('');
    }

    if (onlyIn2.length > 0) {
      lines.push('### Only in Path 2\n');
      for (const f of onlyIn2) lines.push(`+ ${f}`);
      lines.push('');
    }

    lines.push(`### In Both (${inBoth.length} files)\n`);
    for (const f of inBoth.slice(0, 20)) lines.push(`  ${f}`);
    if (inBoth.length > 20) lines.push(`  ... and ${inBoth.length - 20} more`);
  }

  return lines.join('\n');
}

async function getFileTree(dir: string): Promise<string[]> {
  const files: string[] = [];

  if (!existsSync(dir)) return files;

  async function walk(current: string, prefix = '') {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, prefix + entry.name + '/');
      } else {
        files.push(prefix + entry.name);
      }
    }
  }

  await walk(dir);
  return files.sort();
}
