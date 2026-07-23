import { z } from "zod";
import {
  STARTER_KIT_FILES_FALLBACK,
  STARTER_KIT_HTML_BASE,
  STARTER_KIT_REPO,
  STARTER_KIT_BRANCH,
  type StarterKitFile,
} from "../utils/starter-kit.js";

export const listStarterKitFilesInputSchema = z.object({
  directory: z
    .string()
    .optional()
    .describe(
      "Optional directory filter, e.g. 'blocks', 'client', 'components'. Omit to list all files."
    ),
});

export type ListStarterKitFilesInput = z.infer<typeof listStarterKitFilesInputSchema>;

export function listStarterKitFiles(input: ListStarterKitFilesInput): string {
  const { directory } = input;

  // Use fallback for now (GitHub API integration can be added later)
  const files = directory
    ? STARTER_KIT_FILES_FALLBACK.filter(
        (f) => f.path.startsWith(directory + "/") || f.path === directory
      )
    : STARTER_KIT_FILES_FALLBACK;

  if (files.length === 0) {
    return `No files found for directory: "${directory}"\n\nAvailable top-level directories: blocks, client, components, i18n, icons, lib, bin`;
  }

  return formatFileList(files);
}

export async function listStarterKitFilesAsync(
  input: ListStarterKitFilesInput
): Promise<string> {
  const { directory } = input;

  try {
    // Try to fetch from GitHub API
    const { fetchStarterKitDir } = await import("../utils/starter-kit.js");
    const files = await fetchStarterKitDir(directory);

    if (files.length === 0) {
      return `No files found for directory: "${directory}"`;
    }

    return formatFileList(files);
  } catch {
    // Fallback to hardcoded list on error
    return listStarterKitFiles(input) + "\n\n_(Using cached file list. GitHub API unavailable.)_";
  }
}

function formatFileList(files: StarterKitFile[]): string {
  const lines: string[] = [
    `## Automad Theme Starter Kit`,
    `Repository: https://github.com/${STARTER_KIT_REPO} (branch: ${STARTER_KIT_BRANCH})\n`,
    `Use the \`get_starter_kit_file\` tool to read the content of any file below.\n`,
  ];

  for (const file of files) {
    const icon = file.type === "dir" ? "📁" : "📄";
    const link = `${STARTER_KIT_HTML_BASE}/${file.path}`;
    const desc = file.description ? ` — ${file.description}` : "";
    lines.push(`${icon} \`${file.path}\`${desc}`);
    lines.push(`   ${link}`);
  }

  return lines.join("\n");
}
