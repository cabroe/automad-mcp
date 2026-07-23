import { z } from "zod";
import { PAGES, BASE_URL } from "../utils/pages.js";

export const searchDocsInputSchema = z.object({
  query: z.string().min(1).describe("The search term to look for in the Automad documentation."),
});

export type SearchDocsInput = z.infer<typeof searchDocsInputSchema>;

interface SearchResult {
  title: string;
  url: string;
  parent: string;
  score: number;
}

export function searchDocs(input: SearchDocsInput): string {
  const { query } = input;
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) {
    return "Please provide a more specific search query.";
  }

  const results: SearchResult[] = [];

  for (const page of PAGES) {
    const titleLower = page.title.toLowerCase();
    const parentLower = page.parent.toLowerCase();
    const urlLower = page.url.toLowerCase();

    let score = 0;

    for (const term of terms) {
      // Exact title match = highest score
      if (titleLower === term) {
        score += 10;
      } else if (titleLower.startsWith(term)) {
        score += 6;
      } else if (titleLower.includes(term)) {
        score += 4;
      }

      // URL match
      if (urlLower.includes(term)) {
        score += 2;
      }

      // Parent/section match
      if (parentLower.includes(term)) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ title: page.title, url: page.url, parent: page.parent, score });
    }
  }

  if (results.length === 0) {
    return `No documentation pages found for query: "${query}"\n\nTry using the \`list_pages\` tool to browse available pages.`;
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, 10);

  const lines = [
    `Found ${results.length} result(s) for "${query}" (showing top ${top.length}):\n`,
  ];

  for (const r of top) {
    const parentInfo = r.parent ? ` _(${r.parent})_` : "";
    lines.push(`- **${r.title}**${parentInfo}  \n  ${BASE_URL}${r.url}`);
  }

  lines.push(
    `\nUse the \`get_page\` tool with one of these URLs to read the full content.`
  );

  return lines.join("\n");
}
