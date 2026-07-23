import { z } from 'zod';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const themeIssuesInputSchema = z.object({
  themePath: z.string().optional().describe('Path to theme'),
});

export type ThemeIssuesInput = z.infer<typeof themeIssuesInputSchema>;

interface Issue {
  severity: 'error' | 'warning' | 'info';
  file: string;
  message: string;
  suggestion?: string;
}

/**
 * Find Automad-specific issues in a theme
 */
export async function findThemeIssues(input: ThemeIssuesInput): Promise<string> {
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

  const issues: Issue[] = [];

  // Scan all PHP files
  const phpFiles = await getPhpFiles(themeDir);

  for (const file of phpFiles) {
    const content = await readFile(join(themeDir, file), 'utf-8').catch(() => '');
    issues.push(...checkFile(file, content));
  }

  // Format output
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  const lines: string[] = ['## Theme Issues\n'];

  lines.push(
    `**Total:** ${issues.length} (${errors.length} errors, ${warnings.length} warnings, ${infos.length} info)\n`
  );

  if (errors.length > 0) {
    lines.push('### ❌ Errors\n');
    for (const issue of errors) {
      lines.push(`- **${issue.file}:** ${issue.message}`);
      if (issue.suggestion) lines.push(`  → ${issue.suggestion}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('### ⚠️ Warnings\n');
    for (const issue of warnings) {
      lines.push(`- **${issue.file}:** ${issue.message}`);
      if (issue.suggestion) lines.push(`  → ${issue.suggestion}`);
    }
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push('### ℹ️ Info\n');
    for (const issue of infos) {
      lines.push(`- **${issue.file}:** ${issue.message}`);
    }
  }

  if (issues.length === 0) {
    lines.push('✅ No issues found!');
  }

  return lines.join('\n');
}

async function getPhpFiles(dir: string, prefix = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getPhpFiles(fullPath, prefix + entry.name + '/')));
    } else if (entry.name.endsWith('.php')) {
      files.push(prefix + entry.name);
    }
  }

  return files;
}

function checkFile(file: string, content: string): Issue[] {
  const issues: Issue[] = [];

  // Check for nested quotes in def()
  if (/def\([^)]*'[^']*'[^)]*\)/.test(content)) {
    issues.push({
      severity: 'error',
      file,
      message: 'Nested quotes in def() can break parsing',
      suggestion: 'Use a :variable as intermediate step',
    });
  }

  // Check for @ within HTML attributes (MailObfuscation issue)
  if (
    /<[^>]+data-email[^>]*>[^<]*@[^<]*</.test(content) ||
    /<[^>]+placeholder[^>]*>[^<]*@[^<]*</.test(content)
  ) {
    issues.push({
      severity: 'warning',
      file,
      message: "Email address with @ in attribute may be corrupted by Automad's MailObfuscation",
      suggestion: 'Replace @ with &#64; in attribute values',
    });
  }

  // Check for display:none on SVG sprite
  if (/display\s*:\s*none/i.test(content) && /<svg|<symbol|<use/.test(content)) {
    issues.push({
      severity: 'error',
      file,
      message: 'SVG sprite with display:none breaks paint servers (linearGradient etc.)',
      suggestion: 'Use position:absolute; width:0; height:0; overflow:hidden instead',
    });
  }

  // Check for missing snippet definitions
  const snippetCalls = content.match(/<@\s+(\w+)\s+@>/g) || [];
  const definedSnippets = content.match(/<@~\s*snippet\s+(\w+)/g) || [];

  for (const call of snippetCalls) {
    const name = call.replace(/<@\s+/, '').replace(/\s+@>/, '');
    if (
      name !== 'if' &&
      name !== 'end' &&
      name !== 'foreach' &&
      name !== 'with' &&
      name !== 'set' &&
      name !== 'for'
    ) {
      const defined = definedSnippets.some(s => s.includes(name));
      if (!defined && !content.includes(`snippet ${name}`)) {
        // Check if it's defined in another file
        issues.push({
          severity: 'info',
          file,
          message: `Snippet "${name}" called but definition not in this file`,
        });
      }
    }
  }

  // Check for Fields::inTemplate() in comments
  if (/<#.*@\{.*\}.*#>/.test(content)) {
    issues.push({
      severity: 'warning',
      file,
      message: 'Field references in <# comments are still registered as dashboard fields',
      suggestion: 'Remove field names from comments if not meant to be dashboard fields',
    });
  }

  return issues;
}
