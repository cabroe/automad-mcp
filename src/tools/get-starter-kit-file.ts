import { z } from "zod";
import {
  STARTER_KIT_RAW_BASE,
  STARTER_KIT_HTML_BASE,
  STARTER_KIT_REPO,
  READABLE_FILE_EXTENSIONS,
} from "../utils/starter-kit.js";

interface CacheEntry {
  content: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const getStarterKitFileInputSchema = z.object({
  path: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Path to the file in the starter kit repo, e.g. 'README.md', 'default.php', 'theme.json', 'blocks/pagelist/grid.php'. Use list_starter_kit_files to discover valid paths."
    ),
  file: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Alias for 'path'. File path within the repo, e.g. 'README.md', 'default.php', 'theme.json', 'blocks/pagelist/grid.php'."
    ),
}).transform((data) => ({
  path: data.path ?? data.file ?? "",
}));

export type GetStarterKitFileInput = z.infer<typeof getStarterKitFileInputSchema>;

export async function getStarterKitFile(input: GetStarterKitFileInput): Promise<string> {
  const { path } = input;

  // Sanitize path
  const cleanPath = path.replace(/^\/+/, "");

  // Validate file extension is readable
  const ext = getExtension(cleanPath);
  if (ext && !READABLE_FILE_EXTENSIONS.has(ext)) {
    return `File type \`${ext}\` is not supported for reading (binary file). Supported extensions: ${[...READABLE_FILE_EXTENSIONS].join(", ")}`;
  }

  const rawUrl = `${STARTER_KIT_RAW_BASE}/${cleanPath}`;
  const htmlUrl = `${STARTER_KIT_HTML_BASE}/${cleanPath}`;

  // Check cache
  const cached = cache.get(rawUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.content;
  }

  const response = await fetch(rawUrl, {
    headers: {
      "User-Agent": "automad-mcp/1.0",
      Accept: "text/plain",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return `File not found: \`${cleanPath}\`\n\nUse the \`list_starter_kit_files\` tool to see all available files in the Automad Theme Starter Kit (https://github.com/${STARTER_KIT_REPO}).`;
    }
    throw new Error(`Failed to fetch ${rawUrl}: HTTP ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const lang = getLang(cleanPath);
  const result = formatFileContent(cleanPath, text, lang, htmlUrl);

  cache.set(rawUrl, { content: result, timestamp: Date.now() });
  return result;
}

function formatFileContent(path: string, content: string, lang: string, htmlUrl: string): string {
  return [
    `**File**: \`${path}\``,
    `**Source**: ${htmlUrl}\n`,
    `\`\`\`${lang}`,
    content.trimEnd(),
    "```",
  ].join("\n");
}

function getExtension(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "";
  return path.slice(dot).toLowerCase();
}

function getLang(path: string): string {
  const ext = getExtension(path);
  const map: Record<string, string> = {
    ".php": "php",
    ".js": "javascript",
    ".ts": "typescript",
    ".json": "json",
    ".md": "markdown",
    ".css": "css",
    ".less": "less",
    ".sh": "bash",
    ".html": "html",
    ".xml": "xml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".txt": "text",
    ".env": "bash",
  };
  return map[ext] ?? "";
}
