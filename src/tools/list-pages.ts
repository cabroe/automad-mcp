import { z } from "zod";
import { PAGES, SECTIONS, BASE_URL, type Section } from "../utils/pages.js";

export const listPagesInputSchema = z.object({
  section: z
    .enum(SECTIONS)
    .optional()
    .describe(
      `Optional section filter. One of: ${SECTIONS.join(", ")}. If omitted, all pages are returned.`
    ),
});

export type ListPagesInput = z.infer<typeof listPagesInputSchema>;

export function listPages(input: ListPagesInput): string {
  const { section } = input;

  const filtered = section
    ? PAGES.filter((p) => p.section === section)
    : PAGES;

  if (filtered.length === 0) {
    return `No pages found for section: ${section}`;
  }

  // Group by section
  const grouped = new Map<string, typeof PAGES>();
  for (const page of filtered) {
    const s = page.section;
    if (!grouped.has(s)) grouped.set(s, []);
    grouped.get(s)!.push(page);
  }

  const lines: string[] = [];

  for (const [sec, pages] of grouped) {
    lines.push(`\n## ${formatSectionName(sec)}\n`);
    for (const page of pages) {
      const indent = getIndentLevel(page.url);
      const prefix = "  ".repeat(indent);
      lines.push(`${prefix}- **${page.title}** → ${BASE_URL}${page.url}`);
    }
  }

  return lines.join("\n").trim();
}

function formatSectionName(section: string): string {
  return section
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getIndentLevel(url: string): number {
  // Number of path segments minus 1 (root = 0)
  const segments = url.replace(/^\//, "").split("/").filter(Boolean);
  return Math.max(0, segments.length - 1);
}
