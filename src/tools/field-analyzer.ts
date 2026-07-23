import { z } from 'zod';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const fieldAnalyzerInputSchema = z.object({
  themePath: z.string().optional().describe('Absolute path to theme directory'),
  template: z.string().optional().describe('Specific template file to analyze'),
});

export type FieldAnalyzerInput = z.infer<typeof fieldAnalyzerInputSchema>;

interface FieldUsage {
  field: string;
  type: 'page' | 'shared' | 'system' | 'runtime' | 'block';
  count: number;
  templates: string[];
}

/**
 * Analyze which fields/templates are used in a theme
 */
export async function analyzeFields(input: FieldAnalyzerInput): Promise<string> {
  const { themePath, template } = input;

  const searchPaths = themePath
    ? [themePath]
    : [
        join(process.cwd(), 'packages', 'hangdrang', 'automad-theme-hangdrang'),
        join(process.cwd(), 'packages', 'hangdrang', 'hello-world'),
        process.cwd(),
      ];

  let themeDir: string | null = null;
  for (const p of searchPaths) {
    if (existsSync(p)) {
      themeDir = p;
      break;
    }
  }

  if (!themeDir) return formatError('Theme not found. Provide themePath.');

  const themeName = themeDir.split('/').pop() ?? 'unknown';
  let files: string[] = [];

  if (template) {
    const templatePath = join(themeDir, template);
    if (existsSync(templatePath)) files.push(templatePath);
    else return formatError(`Template not found: ${template}`);
  } else {
    files = await getPhpFiles(themeDir);
  }

  const themeJsonPath = join(themeDir, 'theme.json');
  const fieldDefs = existsSync(themeJsonPath)
    ? JSON.parse(await readFile(themeJsonPath, 'utf-8'))
    : {};

  const usage = new Map<string, FieldUsage>();

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const relativePath = file.replace(themeDir + '/', '');

    // Find @{ fieldName } patterns
    const fieldMatches = content.matchAll(/@\{([a-zA-Z0-9_:]+)\}/g);
    for (const match of fieldMatches) {
      const field = match[1] as string;
      if (!usage.has(field)) {
        usage.set(field, { field, type: categorizeField(field), count: 0, templates: [] });
      }
      const u = usage.get(field)!;
      u.count++;
      if (!u.templates.includes(relativePath)) u.templates.push(relativePath);
    }

    // Find <@ @{ +field } @> patterns
    const blockMatches = content.matchAll(/@\{\+([a-zA-Z0-9_]+)\}/g);
    for (const match of blockMatches) {
      const field = '+' + (match[1] as string);
      if (!usage.has(field)) {
        usage.set(field, { field, type: 'block', count: 0, templates: [] });
      }
      const u = usage.get(field)!;
      u.count++;
      if (!u.templates.includes(relativePath)) u.templates.push(relativePath);
    }
  }

  const sorted = [...usage.values()].sort((a, b) => b.count - a.count);

  const lines: string[] = [
    `## Field Usage: ${themeName}\n`,
    `Analyzed ${files.length} file(s), ${sorted.length} unique fields\n`,
    '---\n',
  ];

  // Group by type
  const grouped = new Map<string, FieldUsage[]>();
  for (const u of sorted) {
    if (!grouped.has(u.type)) grouped.set(u.type, []);
    grouped.get(u.type)!.push(u);
  }

  for (const [type, fields] of grouped) {
    lines.push(`\n### ${type.toUpperCase()} Fields`);
    for (const f of fields) {
      lines.push(`\n**\`${f.field}\`** (${f.count}x) — ${f.templates.join(', ')}`);
    }
  }

  // Dashboard field order suggestion
  if (fieldDefs.fieldOrder) {
    lines.push('\n---\n\n### Dashboard fieldOrder');
    lines.push('```json');
    lines.push(`"fieldOrder": [`);
    for (const field of fieldDefs.fieldOrder) lines.push(`    "${field}",`);
    lines.push(']');
    lines.push('```');
  }

  return lines.join('\n');
}

async function getPhpFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await getPhpFiles(fullPath)));
    else if (entry.name.endsWith('.php')) files.push(fullPath);
  }
  return files;
}

function categorizeField(field: string): 'page' | 'shared' | 'system' | 'runtime' | 'block' {
  if (field.startsWith('+')) return 'block';
  if (field.startsWith(':')) return 'runtime';
  if (field.startsWith('select') || field.startsWith('number') || field.startsWith('date'))
    return 'page';
  return 'page';
}

function formatError(message: string): string {
  return `❌ Error\n\n${message}`;
}
