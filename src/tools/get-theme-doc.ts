import { z } from "zod";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

export const getThemeDocInputSchema = z.object({
  path: z
    .string()
    .min(1)
    .optional()
    .describe("Path within the theme (e.g. 'components/page.php', 'README.md')"),
  themePath: z
    .string()
    .optional()
    .describe(
      "Absolute path to a theme directory. Defaults to looking in common locations."
    ),
});

export type GetThemeDocInput = z.infer<typeof getThemeDocInputSchema>;

interface ThemeDocResult {
  content: string;
  filePath: string;
}

/**
 * Find and read documentation from a local theme.
 * Looks for: CLAUDE.md, README.md, theme.json, or specific files.
 */
export async function getThemeDoc(
  input: GetThemeDocInput
): Promise<string> {
  const { path, themePath } = input;

  // Common theme locations to search
  const searchPaths = themePath
    ? [themePath]
    : [
        join(process.cwd(), "packages", "hangdrang", "automad-theme-hangdrang"),
        join(process.cwd(), "packages", "hangdrang", "hello-world"),
        process.cwd(),
        join(process.env.HOME ?? "", "Projects", "automad", "packages", "hangdrang"),
      ];

  // Find the theme directory
  let themeDir: string | null = null;
  for (const searchPath of searchPaths) {
    if (existsSync(searchPath)) {
      themeDir = searchPath;
      break;
    }
  }

  if (!themeDir) {
    return formatError(
      "Theme not found in common locations. Provide an explicit themePath."
    );
  }

  // If no specific path requested, return CLAUDE.md or README.md
  if (!path) {
    return await getThemeOverview(themeDir);
  }

  // Read specific file
  const filePath = resolve(themeDir, path);

  // Security: ensure file is within theme directory
  if (!filePath.startsWith(themeDir)) {
    return formatError("Access denied: path is outside theme directory.");
  }

  if (!existsSync(filePath)) {
    return formatError(`File not found: ${path}\n\nTheme directory: ${themeDir}`);
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return formatFileContent(path, content, filePath);
  } catch (err) {
    return formatError(`Failed to read file: ${(err as Error).message}`);
  }
}

async function getThemeOverview(themeDir: string): Promise<string> {
  const filesToTry = ["CLAUDE.md", "README.md", "theme.json"];
  const lines: string[] = [`## Theme Documentation\n`, `Theme directory: ${themeDir}\n`];

  for (const file of filesToTry) {
    const filePath = join(themeDir, file);
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, "utf-8");
        const preview = content.slice(0, 2000);
        lines.push(`### ${file}`);
        lines.push("```");
        lines.push(preview);
        if (content.length > 2000) lines.push("...");
        lines.push("```\n");
      } catch {
        // Skip unreadable files
      }
    }
  }

  // List all PHP files
  const { readdir } = await import("fs/promises");
  try {
    const allFiles = await getAllFiles(themeDir, []);
    const phpFiles = allFiles.filter(
      (f) => f.endsWith(".php") && !f.includes("node_modules")
    );

    if (phpFiles.length > 0) {
      lines.push("### Available PHP Templates\n");
      for (const file of phpFiles.slice(0, 20)) {
        const relative = file.replace(themeDir + "/", "");
        lines.push(`- \`${relative}\``);
      }
      if (phpFiles.length > 20) {
        lines.push(`- ... and ${phpFiles.length - 20} more`);
      }
    }
  } catch {
    // Skip if directory listing fails
  }

  return lines.join("\n");
}

async function getAllFiles(dir: string, files: string[]): Promise<string[]> {
  const { readdir } = await import("fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git") continue;

    if (entry.isDirectory()) {
      await getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function formatFileContent(path: string, content: string, filePath: string): string {
  const lines: string[] = [
    `**File**: \`${path}\``,
    `**Path**: ${filePath}\n`,
    `\`\`\``,
  ];

  // Detect language
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    php: "php",
    ts: "typescript",
    js: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    less: "less",
  };
  const lang = langMap[ext ?? ""] ?? "";

  if (lang) lines[2] = `\`\`\`${lang}`;
  lines.push(content);
  lines.push("```");

  return lines.join("\n");
}

function formatError(message: string): string {
  return `❌ **Error**\n\n${message}\n\nUse \`get_theme_doc\` with a specific path like \`components/page.php\` or \`theme.json\`.`;
}
