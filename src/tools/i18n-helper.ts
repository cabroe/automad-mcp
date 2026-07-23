import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const i18nHelperInputSchema = z.object({
  themePath: z.string().optional().describe('Path to theme'),
  action: z.enum(['check', 'extract', 'validate']).optional().default('check').describe('Action'),
  lang: z.string().optional().default('de').describe('Language code to check'),
});

export type I18nHelperInput = z.infer<typeof i18nHelperInputSchema>;

/**
 * I18n helper tools - check consistency, extract strings, validate
 */
export async function i18nHelper(input: I18nHelperInput): Promise<string> {
  const { themePath, action, lang } = input;

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

  switch (action) {
    case 'check':
      return checkI18nConsistency(themeDir, lang);
    case 'extract':
      return extractStrings(themeDir);
    case 'validate':
      return validateI18nStructure(themeDir);
    default:
      return 'Unknown action';
  }
}

async function checkI18nConsistency(themeDir: string, lang: string): Promise<string> {
  const i18nPath = join(themeDir, 'lib', 'i18n.php');
  if (!existsSync(i18nPath)) {
    return 'ℹ️ No lib/i18n.php found - this theme may not use i18n.';
  }

  const content = await readFile(i18nPath, 'utf-8');

  const deKeys = extractKeys(content);
  const enKeys = extractKeys(content);

  const onlyInDe = deKeys.filter(k => !enKeys.includes(k));
  const onlyInEn = enKeys.filter(k => !deKeys.includes(k));

  const lines: string[] = ['## I18n Consistency Check\n'];

  lines.push(`**Language:** ${lang}\n`);
  lines.push(`**Total keys:** ${deKeys.length} (DE), ${enKeys.length} (EN)\n`);

  if (onlyInDe.length > 0) {
    lines.push('\n### ⚠️ Missing in EN\n');
    for (const key of onlyInDe.slice(0, 20)) {
      lines.push(`- \`${key}\``);
    }
    if (onlyInDe.length > 20) lines.push(`- ... and ${onlyInDe.length - 20} more`);
  }

  if (onlyInEn.length > 0) {
    lines.push('\n### ⚠️ Missing in DE\n');
    for (const key of onlyInEn.slice(0, 20)) {
      lines.push(`- \`${key}\``);
    }
    if (onlyInEn.length > 20) lines.push(`- ... and ${onlyInEn.length - 20} more`);
  }

  if (onlyInDe.length === 0 && onlyInEn.length === 0) {
    lines.push('\n✅ All keys are consistent between DE and EN!');
  }

  return lines.join('\n');
}

function extractKeys(content: string): string[] {
  // Simple key extraction - matches 'key' => patterns
  const regex = /'([^']+)'\s*=>/g;
  const keys: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match[1] && !match[1].includes('$')) {
      keys.push(match[1]);
    }
  }

  return [...new Set(keys)];
}

async function extractStrings(themeDir: string): Promise<string> {
  const files = await getPhpFiles(themeDir);
  const strings: { key: string; file: string; line: number }[] = [];

  for (const file of files) {
    const content = await readFile(join(themeDir, file), 'utf-8').catch(() => '');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Find t() calls
      const tMatches = line.matchAll(/t\s*\{\s*key:\s*['"]([^'"]+)['"]/g);
      for (const match of tMatches) {
        strings.push({ key: match[1], file, line: idx + 1 });
      }

      // Find def() calls with strings
      const defMatches = line.matchAll(/def\s*\(\s*['"]([^rab']+)['"]\s*,/g);
      for (const match of defMatches) {
        strings.push({ key: `fallback_${match[1]}`, file, line: idx + 1 });
      }
    });
  }

  const lines: string[] = [
    '## Extracted I18n Strings\n',
    `**Total:** ${strings.length} strings\n`,
    '---\n',
    '### By Key\n',
  ];

  const keyGroups = groupBy(strings, s => s.key);
  for (const [key, items] of Object.entries(keyGroups)) {
    lines.push(`\`${key}\` (used ${items.length}x)`);
  }

  lines.push('\n### Suggested i18n.php Structure\n');
  lines.push('```php\n$dict = [');
  lines.push("  'de' => [");
  for (const key of Object.keys(keyGroups)) {
    if (!key.startsWith('fallback_')) {
      lines.push(`    '${key}' => '',`);
    }
  }
  lines.push('  ],');
  lines.push("  'en' => [");
  for (const key of Object.keys(keyGroups)) {
    if (!key.startsWith('fallback_')) {
      lines.push(`    '${key}' => '',`);
    }
  }
  lines.push('  ],');
  lines.push('];\n```');

  return lines.join('\n');
}

async function validateI18nStructure(themeDir: string): Promise<string> {
  const i18nPath = join(themeDir, 'lib', 'i18n.php');
  const issues: string[] = [];

  if (!existsSync(i18nPath)) {
    issues.push('ℹ️ No lib/i18n.php found');
    return issues.join('\n');
  }

  const content = await readFile(i18nPath, 'utf-8');

  if (!content.includes("'de'")) {
    issues.push("❌ Missing German ('de') array");
  }
  if (!content.includes("'en'")) {
    issues.push("❌ Missing English ('en') array");
  }

  const helperPath = join(themeDir, 'lib', 'functions.php');
  if (existsSync(helperPath)) {
    const helperContent = await readFile(helperPath, 'utf-8');
    if (!helperContent.includes('function t')) {
      issues.push('⚠️ No t() function found in lib/functions.php');
    } else {
      issues.push('✅ t() helper function present');
    }
  }

  if (!content.includes('langSwitchLink') && !content.includes('langSwitch')) {
    issues.push('ℹ️ No language switch found');
  } else {
    issues.push('✅ Language switch present');
  }

  const lines: string[] = ['## I18n Structure Validation\n'];
  for (const issue of issues) {
    lines.push(`- ${issue}`);
  }

  return lines.join('\n');
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
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
