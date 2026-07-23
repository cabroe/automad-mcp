import { z } from "zod";
import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export const themeCompareInputSchema = z.object({
  baseTheme: z
    .string()
    .optional()
    .describe("Base theme (usually Starter Kit)"),
  compareTheme: z
    .string()
    .optional()
    .describe("Theme to compare against base"),
  starterKitAsBase: z
    .boolean()
    .optional()
    .default(true)
    .describe("Use Starter Kit as base for comparison"),
});

export type ThemeCompareInput = z.infer<typeof themeCompareInputSchema>;

interface ThemeStructure {
  name: string;
  path: string;
  files: string[];
  directories: string[];
  hasComponents: boolean;
  hasDist: boolean;
  hasLib: boolean;
  hasI18n: boolean;
}

interface ComparisonResult {
  missing: string[];
  extra: string[];
  different: string[];
  same: string[];
}

/**
 * Compare two themes or a theme against the Starter Kit
 */
export async function compareThemes(input: ThemeCompareInput): Promise<string> {
  const { baseTheme, compareTheme, starterKitAsBase } = input;

  // If using Starter Kit as base, we'll simulate it
  const starterKitFiles = [
    "README.md",
    "theme.json",
    "composer.json",
    "package.json",
    "tsconfig.json",
    ".editorconfig",
    "default.php",
    "page_not_found.php",
    "components/page.php",
    "components/nav.php",
    "components/footer.php",
    "components/layout.php",
    "lib/functions.php",
    "dist/main.css",
    "dist/main.js",
  ];

  // Get base theme
  let base: ThemeStructure | null = null;
  let compare: ThemeStructure | null = null;

  if (baseTheme && existsSync(baseTheme)) {
    base = await analyzeTheme(baseTheme, "Base");
  } else if (starterKitAsBase) {
    base = {
      name: "Automad Theme Starter Kit",
      path: "https://github.com/automadcms/automad-theme-starter-kit",
      files: starterKitFiles,
      directories: ["components", "lib", "dist", "blocks", "client", "i18n", "icons"],
      hasComponents: true,
      hasDist: true,
      hasLib: true,
      hasI18n: true,
    };
  }

  // Get compare theme
  const searchPaths = compareTheme
    ? [compareTheme]
    : [
        join(process.cwd(), "packages", "hangdrang", "automad-theme-hangdrang"),
        join(process.cwd(), "packages", "hangdrang", "hello-world"),
        process.cwd(),
      ];

  for (const p of searchPaths) {
    if (existsSync(p)) {
      compare = await analyzeTheme(p, "Compare");
      break;
    }
  }

  if (!compare) {
    return formatError(
      "No theme found to compare. Provide compareTheme path or run from a theme directory."
    );
  }

  const lines: string[] = [
    `## Theme Comparison\n`,
  ];

  if (base) {
    lines.push(`**Base:** ${base.name}`);
  }
  lines.push(`**Compare:** ${compare.name}\n`);
  lines.push("---\n");

  // Structure comparison
  lines.push("### Directory Structure\n");

  if (base) {
    const missingDirs = base.directories.filter((d) => !compare.directories.includes(d));
    const extraDirs = compare.directories.filter((d) => !base.directories.includes(d));

    if (missingDirs.length > 0) {
      lines.push("**Missing directories (from base):**");
      for (const d of missingDirs) {
        lines.push(`- \`${d}/\``);
      }
      lines.push("");
    }

    if (extraDirs.length > 0) {
      lines.push("**Extra directories (not in base):**");
      for (const d of extraDirs) {
        lines.push(`+ \`${d}/\``);
      }
      lines.push("");
    }
  }

  // Feature comparison
  lines.push("### Features\n");

  const features = [
    { name: "components/", key: "hasComponents" as const },
    { name: "dist/", key: "hasDist" as const },
    { name: "lib/", key: "hasLib" as const },
    { name: "i18n support", key: "hasI18n" as const },
  ];

  for (const f of features) {
    const has = compare[f.key];
    const symbol = has ? "✅" : "❌";
    lines.push(`${symbol} ${f.name}`);
  }
  lines.push("");

  // File comparison
  if (base) {
    lines.push("### Files\n");

    const missing = base.files.filter((f) => !compare.files.includes(f));
    const extra = compare.files.filter((f) => !base.files.includes(f));

    if (missing.length > 0) {
      lines.push("**Missing (from base):**");
      for (const f of missing) {
        lines.push(`- \`${f}\``);
      }
      lines.push("");
    }

    if (extra.length > 0) {
      lines.push("**Extra (not in base):**");
      for (const f of extra) {
        lines.push(`+ \`${f}\``);
      }
      lines.push("");
    }

    // Find common files
    const common = base.files.filter((f) => compare.files.includes(f));
    if (common.length > 0) {
      lines.push(`**Common files:** ${common.length}\n`);
    }
  }

  // File listing
  lines.push("---\n\n### All Compare Theme Files\n");
  for (const file of compare.files.slice(0, 50)) {
    lines.push(`- \`${file}\``);
  }
  if (compare.files.length > 50) {
    lines.push(`- ... and ${compare.files.length - 50} more`);
  }

  // Recommendations
  lines.push("\n---\n\n### Recommendations\n");

  const recommendations: string[] = [];

  if (!compare.hasComponents) {
    recommendations.push(
      "Add `components/` directory with `page.php` for reusable template structure"
    );
  }

  if (!compare.hasDist) {
    recommendations.push(
      "Add `dist/` directory and pre-compile CSS/JS for production"
    );
  }

  if (!compare.hasLib) {
    recommendations.push(
      "Add `lib/` directory for helper functions (e.g., `functions.php`)"
    );
  }

  if (recommendations.length > 0) {
    for (const rec of recommendations) {
      lines.push(`- ${rec}`);
    }
  } else {
    lines.push("Theme structure looks complete! 🎉");
  }

  return lines.join("\n");
}

async function analyzeTheme(
  themePath: string,
  _name: string
): Promise<ThemeStructure> {
  const files: string[] = [];
  const directories: string[] = [];

  let hasComponents = false;
  let hasDist = false;
  let hasLib = false;
  let hasI18n = false;

  async function scan(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;

      const relative = join(dir, entry.name).replace(themePath + "/", "");

      if (entry.isDirectory()) {
        directories.push(relative);
        if (relative === "components") hasComponents = true;
        if (relative === "dist") hasDist = true;
        if (relative === "lib") hasLib = true;
        if (relative === "i18n") hasI18n = true;
        await scan(join(dir, entry.name));
      } else {
        files.push(relative);
      }
    }
  }

  await scan(themePath);

  const themeName = themePath.split("/").pop() ?? "unknown";

  return {
    name: themeName,
    path: themePath,
    files: files.sort(),
    directories: directories.sort(),
    hasComponents,
    hasDist,
    hasLib,
    hasI18n,
  };
}

function formatError(message: string): string {
  return `❌ **Error**\n\n${message}\n\nUse \`compare_themes\` with compareTheme path or run from a theme directory.`;
}
