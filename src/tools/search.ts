import { z } from "zod";
import { PAGES, BASE_URL } from "../utils/pages.js";

export const searchDocsInputSchema = z.object({
  query: z.string().min(1).describe("The search term to look for in the Automad documentation."),
  page: z.number().int().min(1).default(1).optional().describe("Page number for pagination (default: 1)."),
  perPage: z.number().int().min(1).max(50).default(10).optional().describe("Number of results per page (default: 10, max: 50)."),
});

export type SearchDocsInput = z.infer<typeof searchDocsInputSchema>;

interface SearchResult {
  title: string;
  url: string;
  parent: string;
  score: number;
}

export function searchDocs(input: SearchDocsInput): string {
  const { query, page = 1, perPage = 10 } = input;
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

  // Pagination
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / perPage);
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * perPage;
  const paginatedResults = results.slice(startIndex, startIndex + perPage);

  const lines: string[] = [
    `Found ${totalResults} result(s) for "${query}" (page ${clampedPage}/${totalPages}):\n`,
  ];

  for (const r of paginatedResults) {
    const parentInfo = r.parent ? ` _(${r.parent})_` : "";
    lines.push(`- **${r.title}**${parentInfo}  \n  ${BASE_URL}${r.url}`);
  }

  // Pagination controls
  if (totalPages > 1) {
    lines.push("\n_Pagination:_");
    const prevPage = clampedPage > 1 ? clampedPage - 1 : null;
    const nextPage = clampedPage < totalPages ? clampedPage + 1 : null;

    if (prevPage) {
      lines.push(`- Previous: page ${prevPage}`);
    }
    if (nextPage) {
      lines.push(`- Next: page ${nextPage}`);
    }
    lines.push(`- Show more: add \`page: ${clampedPage + 1}\` to your search`);
  }

  lines.push(
    `\nUse the \`get_page\` tool with one of these URLs to read the full content.`
  );

  return lines.join("\n");
}
