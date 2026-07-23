import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const fieldValidatorInputSchema = z.object({
  themePath: z.string().optional().describe('Path to theme'),
  style: z
    .enum(['camel', 'snake', 'both'])
    .optional()
    .default('snake')
    .describe('Naming convention'),
});

export type FieldValidatorInput = z.infer<typeof fieldValidatorInputSchema>;

/**
 * Validate field names follow consistent naming conventions
 */
export async function validateFieldNames(input: FieldValidatorInput): Promise<string> {
  const { themePath, style } = input;

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

  // Check theme.json
  const themeJsonPath = join(themeDir, 'theme.json');
  const issues: string[] = [];

  if (existsSync(themeJsonPath)) {
    const content = await readFile(themeJsonPath, 'utf-8');
    const theme = JSON.parse(content);

    if (theme.fieldOrder) {
      for (const field of theme.fieldOrder) {
        if (style === 'camel' && /_/.test(field)) {
          issues.push(`⚠️ "${field}" uses snake_case but camelCase expected`);
        }
        if (style === 'snake' && /[A-Z]/.test(field)) {
          issues.push(`⚠️ "${field}" uses camelCase but snake_case expected`);
        }
      }
    }

    // Check field labels match
    if (theme.labels) {
      for (const field of Object.keys(theme.labels)) {
        if (!theme.fieldOrder?.includes(field)) {
          issues.push(`ℹ️ Label for "${field}" but field not in fieldOrder`);
        }
      }
    }
  }

  // Scan PHP files for field references
  const phpFiles = await getPhpFiles(themeDir);
  const fieldRefs = new Set<string>();

  for (const file of phpFiles) {
    const content = await readFile(join(themeDir, file), 'utf-8').catch(() => '');

    // Find @{ fieldName } patterns
    const matches = content.matchAll(/@\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g);
    for (const match of matches) {
      fieldRefs.add(match[1]);
    }

    // Find def('fieldName') patterns
    const defMatches = content.matchAll(/def\s*\(\s*['"]?([a-zA-Z_][a-zA-Z0-9_]*)['"]?\s*/g);
    for (const match of defMatches) {
      fieldRefs.add(match[1]);
    }
  }

  const lines: string[] = ['## Field Name Validation\n'];

  lines.push(`**Convention:** ${style}\n`);
  lines.push(`**Referenced fields:** ${fieldRefs.size}\n`);

  if (issues.length > 0) {
    lines.push('\n### Issues\n');
    for (const issue of issues) {
      lines.push(`- ${issue}`);
    }
  } else {
    lines.push('\n✅ All field names follow the convention!');
  }

  // Show field statistics
  const snakeFields = [...fieldRefs].filter(f => /_/.test(f));
  const camelFields = [...fieldRefs].filter(f => /[A-Z]/.test(f) && !/_/.test(f));

  lines.push('\n### Statistics\n');
  lines.push(`| Type | Count |`);
  lines.push(`|------|-------|`);
  lines.push(`| snake_case | ${snakeFields.length} |`);
  lines.push(`| camelCase | ${camelFields.length} |`);
  lines.push(`| Other | ${fieldRefs.size - snakeFields.length - camelFields.length} |`);

  return lines.join('\n');
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
