import { z } from "zod";
import {
  STARTER_KIT_FILES,
  STARTER_KIT_HTML_BASE,
  STARTER_KIT_REPO,
  STARTER_KIT_BRANCH,
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

  const filtered = directory
    ? STARTER_KIT_FILES.filter(
        (f) => f.path.startsWith(directory + "/") || f.path === directory
      )
    : STARTER_KIT_FILES;

  if (filtered.length === 0) {
    return `No files found for directory: "${directory}"\n\nAvailable top-level directories: blocks, client, components, i18n, icons, lib, bin`;
  }

  const lines: string[] = [
    `## Automad Theme Starter Kit`,
    `Repository: https://github.com/${STARTER_KIT_REPO} (branch: ${STARTER_KIT_BRANCH})\n`,
    `Use the \`get_starter_kit_file\` tool to read the content of any file below.\n`,
  ];

  for (const file of filtered) {
    const icon = file.type === "dir" ? "📁" : "📄";
    const link = `${STARTER_KIT_HTML_BASE}/${file.path}`;
    const desc = file.description ? ` — ${file.description}` : "";
    lines.push(`${icon} \`${file.path}\`${desc}`);
    lines.push(`   ${link}`);
  }

  return lines.join("\n");
}
