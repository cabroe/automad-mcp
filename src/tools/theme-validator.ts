import { z } from "zod";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

export const themeValidatorInputSchema = z.object({
  themePath: z
    .string()
    .optional()
    .describe("Absolute path to theme directory"),
});

export type ThemeValidatorInput = z.infer<typeof themeValidatorInputSchema>;

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

interface ValidationReport {
  theme: string;
  results: ValidationResult[];
  score: number;
  passed: number;
  failed: number;
}

/**
 * Validate a theme against best practices
 */
export async function validateTheme(
  input: ThemeValidatorInput
): Promise<string> {
  const { themePath } = input;

  // Find theme
  const searchPaths = themePath
    ? [themePath]
    : [
        join(process.cwd(), "packages", "hangdrang", "automad-theme-hangdrang"),
        join(process.cwd(), "packages", "hangdrang", "hello-world"),
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
    return formatError("Theme not found. Provide themePath.");
  }

  const themeName = themeDir.split("/").pop() ?? "unknown";
  const results: ValidationResult[] = [];

  // Check required files
  const requiredFiles = ["theme.json", "default.php"];
  for (const file of requiredFiles) {
    const exists = existsSync(join(themeDir, file));
    results.push({
      name: `${file} exists`,
      passed: exists,
      message: exists
        ? `Found ${file}`
        : `Missing ${file} - required for Automad theme`,
      severity: exists ? "info" : "error",
    });
  }

  // Check theme.json structure
  const themeJsonPath = join(themeDir, "theme.json");
  if (existsSync(themeJsonPath)) {
    try {
      const content = await readFile(themeJsonPath, "utf-8");
      const theme = JSON.parse(content);

      // Required fields
      const requiredFields = ["name", "description", "author", "license"];
      for (const field of requiredFields) {
        const has = !!theme[field];
        results.push({
          name: `theme.json.${field}`,
          passed: has,
          message: has
            ? `Has ${field}: "${theme[field]}"`
            : `Missing ${field} in theme.json`,
          severity: has ? "info" : "error",
        });
      }

      // Version check
      if (!theme.version) {
        results.push({
          name: "theme.json.version",
          passed: false,
          message: "Missing version - recommended for package management",
          severity: "warning",
        });
      }
    } catch {
      results.push({
        name: "theme.json.parse",
        passed: false,
        message: "theme.json is invalid JSON",
        severity: "error",
      });
    }
  }

  // Check structure
  const componentsDir = join(themeDir, "components");
  const hasComponents = existsSync(componentsDir);
  results.push({
    name: "components directory",
    passed: hasComponents,
    message: hasComponents
      ? "Uses Starter Kit component structure"
      : "No components directory - consider using components/ for reusability",
    severity: hasComponents ? "info" : "warning",
  });

  // Check dist directory
  const distDir = join(themeDir, "dist");
  const hasDist = existsSync(distDir);
  results.push({
    name: "dist directory",
    passed: hasDist,
    message: hasDist
      ? "Has dist/ for compiled assets"
      : "No dist/ - CSS/JS should be pre-compiled",
    severity: hasDist ? "info" : "warning",
  });

  // Check for inline styles (bad practice)
  const phpFiles = await getPhpFiles(themeDir);
  let hasInlineStyles = false;
  for (const file of phpFiles) {
    const content = await readFile(file, "utf-8");
    if (content.includes("<style>") && !file.includes("blocks/")) {
      hasInlineStyles = true;
      break;
    }
  }
  results.push({
    name: "no inline styles",
    passed: !hasInlineStyles,
    message: hasInlineStyles
      ? "Found inline <style> tags - use dist/main.css instead"
      : "No inline styles - good practice",
    severity: hasInlineStyles ? "warning" : "info",
  });

  // Check for @{} usage (template syntax)
  let hasTemplateSyntax = false;
  for (const file of phpFiles) {
    const content = await readFile(file, "utf-8");
    if (content.includes("@{") || content.includes("<@")) {
      hasTemplateSyntax = true;
      break;
    }
  }
  results.push({
    name: "uses template syntax",
    passed: hasTemplateSyntax,
    message: hasTemplateSyntax
      ? "Uses Automad template syntax"
      : "No @{} syntax found - is this an Automad theme?",
    severity: hasTemplateSyntax ? "info" : "warning",
  });

  // Check i18n support
  const libDir = join(themeDir, "lib");
  const i18nFile = join(libDir, "i18n.php");
  const hasI18n = existsSync(i18nFile);
  results.push({
    name: "i18n support",
    passed: hasI18n,
    message: hasI18n
      ? "Has lib/i18n.php for translations"
      : "No i18n - consider adding lib/i18n.php for multi-language",
    severity: hasI18n ? "info" : "warning",
  });

  // Calculate score
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const score = Math.round((passed / results.length) * 100);

  return formatReport({
    theme: themeName,
    results,
    score,
    passed,
    failed,
  });
}

async function getPhpFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getPhpFiles(fullPath)));
    } else if (entry.name.endsWith(".php")) {
      files.push(fullPath);
    }
  }

  return files;
}

function formatReport(report: ValidationReport): string {
  const lines: string[] = [
    `## Theme Validation: ${report.theme}`,
    "",
    `### Score: ${report.score}%`,
    `- ✅ Passed: ${report.passed}`,
    `- ❌ Failed: ${report.failed}`,
    "",
  ];

  // Group by severity
  const errors = report.results.filter((r) => r.severity === "error" && !r.passed);
  const warnings = report.results.filter((r) => r.severity === "warning" && !r.passed);
  const info = report.results.filter((r) => r.passed);

  if (errors.length > 0) {
    lines.push("### ❌ Errors");
    for (const r of errors) {
      lines.push(`- **${r.name}**: ${r.message}`);
    }
    lines.push("");
  }

  if (warnings.length > 0) {
    lines.push("### ⚠️ Warnings");
    for (const r of warnings) {
      lines.push(`- **${r.name}**: ${r.message}`);
    }
    lines.push("");
  }

  if (info.length > 0) {
    lines.push("### ✅ Passed Checks");
    for (const r of info.slice(0, 10)) {
      lines.push(`- ${r.name}`);
    }
    if (info.length > 10) {
      lines.push(`- ... and ${info.length - 10} more`);
    }
  }

  return lines.join("\n");
}

function formatError(message: string): string {
  return `❌ **Error**\n\n${message}\n\nUse \`validate_theme\` with a themePath parameter.`;
}
