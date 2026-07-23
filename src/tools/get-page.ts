import { z } from 'zod';
import { fetchPage } from '../utils/scraper.js';
import { PAGES, BASE_URL } from '../utils/pages.js';

export const getPageInputSchema = z.object({
  url: z
    .string()
    .min(1)
    .describe(
      `URL of the documentation page to fetch. Can be a full URL (https://automad.org/...) or a relative path (/getting-started). Use the \`search_docs\` or \`list_pages\` tools to discover valid URLs.`
    ),
});

export type GetPageInput = z.infer<typeof getPageInputSchema>;

export async function getPage(input: GetPageInput): Promise<string> {
  const { url } = input;

  // Validate that the URL belongs to automad.org
  const normalized = normalizeUrl(url);
  if (!normalized.startsWith(BASE_URL)) {
    throw new Error(`Only automad.org documentation URLs are supported. Got: ${url}`);
  }

  // Try to add breadcrumb context from our index
  const path = normalized.replace(BASE_URL, '');
  const page = PAGES.find(p => p.url === path);

  let header = '';
  if (page) {
    const breadcrumb = buildBreadcrumb(path);
    header = `**Section**: ${breadcrumb}\n\n`;
  }

  const content = await fetchPage(normalized);
  return header + content;
}

function normalizeUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('https://') || urlOrPath.startsWith('http://')) {
    return urlOrPath;
  }
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${BASE_URL}${path}`;
}

function buildBreadcrumb(path: string): string {
  const segments = path.replace(/^\//, '').split('/');
  const crumbs: string[] = ['Automad'];

  let currentPath = '';
  for (const seg of segments) {
    currentPath += `/${seg}`;
    const match = PAGES.find(p => p.url === currentPath);
    if (match) {
      crumbs.push(match.title);
    }
  }

  return crumbs.join(' › ');
}
