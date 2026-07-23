import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const themeValidatorInputSchema = z.object({
  themePath: z.string().optional().describe('Absolute path to theme directory'),
});

export type ThemeValidatorInput = z.infer<typeof themeValidatorInputSchema>;

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validate a theme against Automad best practices
 */
export async function validateTheme(input: ThemeValidatorInput): Promise<string> {
  const { themePath } = input;

  // Find theme
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

  if (!themeDir) {
    return formatError('Theme not found. Provide themePath.');
  }

  const themeName = themeDir.split('/').pop() ?? 'unknown';
  const results: ValidationResult[] = [];

  // Required files
  const requiredFiles = ['theme.json', 'default.php'];
  for (const file of requiredFiles) {
    const exists = existsSync(join(themeDir, file));
    results.push({
      name: `${file} exists`,
      passed: exists,
      message: exists ? `✓ Found ${file}` : `✗ Missing ${file} - required!`,
      severity: exists ? 'info' : 'error',
    });
  }

  // theme.json structure
  const themeJsonPath = join(themeDir, 'theme.json');
  if (existsSync(themeJsonPath)) {
    try {
      const theme = JSON.parse(await readFile(themeJsonPath, 'utf-8'));
      const requiredFields = ['name', 'description', 'author', 'license'];
      for (const field of requiredFields) {
        const has = !!theme[field];
        results.push({
          name: `theme.json.${field}`,
          passed: has,
          message: has ? `✓ ${field}: "${theme[field]}"` : `✗ Missing ${field}`,
          severity: has ? 'info' : 'error',
        });
      }
      if (!theme.version) {
        results.push({
          name: 'theme.json.version',
          passed: false,
          message: '⚠️ No version - recommended for package management',
          severity: 'warning',
        });
      }
    } catch {
      results.push({
        name: 'theme.json.parse',
        passed: false,
        message: '✗ Invalid JSON',
        severity: 'error',
      });
    }
  }

  // Structure checks
  const checks = [
    { path: 'components', name: 'components/', msg: 'Component directory' },
    { path: 'dist', name: 'dist/', msg: 'Compiled assets directory' },
    { path: 'lib', name: 'lib/', msg: 'PHP helpers directory' },
  ];

  for (const check of checks) {
    const exists = existsSync(join(themeDir, check.path));
    results.push({
      name: check.name,
      passed: exists,
      message: exists ? `✓ ${check.msg}` : `⚠️ No ${check.msg} - optional`,
      severity: 'info',
    });
  }

  // Check for syntax errors
  const phpFiles = await getPhpFiles(themeDir);
  for (const file of phpFiles) {
    const content = await readFile(file, 'utf-8');
    // Check for common issues
    if (content.includes('<@') && !content.includes('<@~') && !content.includes('<@ end')) {
      // Has <@ but maybe malformed - just a basic check
    }
    // Check for inline styles
    if (content.includes('<style>') && !file.includes('blocks/')) {
      results.push({
        name: `inline styles`,
        passed: false,
        message: `⚠️ Inline <style> in ${file.replace(themeDir + '/', '')} - use dist/main.css`,
        severity: 'warning',
      });
    }
  }

  // Check +main usage
  const hasMainBlock = phpFiles.some(async f => {
    const c = await readFile(f, 'utf-8');
    return c.includes('@{ +main }');
  });

  results.push({
    name: '+main block',
    passed: hasMainBlock,
    message: hasMainBlock
      ? '✓ Uses @{ +main } for block editor'
      : '⚠️ No @{ +main } found - is block editor supported?',
    severity: hasMainBlock ? 'info' : 'warning',
  });

  // Score
  const passed = results.filter(r => r.passed).length;
  const score = Math.round((passed / results.length) * 100);

  const lines: string[] = [
    `## Theme Validation: ${themeName}`,
    '',
    `### Score: ${score}% (${passed}/${results.length} checks)\n`,
    '---\n',
  ];

  // Show results
  const errors = results.filter(r => r.severity === 'error' && !r.passed);
  const warnings = results.filter(r => r.severity === 'warning' && !r.passed);
  const passed_checks = results.filter(r => r.passed);

  if (errors.length > 0) {
    lines.push('### ✗ Errors');
    for (const r of errors) lines.push(`- **${r.name}**: ${r.message}`);
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('### ⚠️ Warnings');
    for (const r of warnings) lines.push(`- ${r.name}: ${r.message}`);
    lines.push('');
  }

  if (passed_checks.length > 0) {
    lines.push('### ✓ Passed');
    for (const r of passed_checks.slice(0, 10)) lines.push(`- ${r.name}`);
    if (passed_checks.length > 10) lines.push(`- ... and ${passed_checks.length - 10} more`);
  }

  // Debug tips
  lines.push('\n---\n\n### Debug Tips');
  lines.push('- **Cache leeren:** `rm -rf cache/*` nach Änderungen');
  lines.push('- **Theme prüfen:** Seite editieren → Theme-Dropdown prüfen');
  lines.push('- **short_open_tag:** Muss in php.ini `On` sein');

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

function formatError(message: string): string {
  return `❌ Error\n\n${message}\n\nUse validate_theme with themePath parameter.`;
}
