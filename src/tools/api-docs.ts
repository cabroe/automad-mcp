import { z } from 'zod';
import { BASE_URL } from '../utils/pages.js';

export const apiDocsInputSchema = z.object({
  type: z.enum(['all', 'php', 'rest', 'webhooks']).optional().default('all').describe('API type'),
});

export type ApiDocsInput = z.infer<typeof apiDocsInputSchema>;

// Live URLs on automad.org — the docs root no longer exposes /api/... sub-paths,
// so each section points to the real page that documents it.
const API_DOCS = {
  php: {
    title: 'PHP API',
    url: '/developer-guide/api-reference',
    description: 'Server-side PHP API for theme development',
    endpoints: [
      { name: 'Automad::getContext()', desc: 'Get current page context' },
      { name: 'Automad::getShared()', desc: 'Get shared/global data' },
      { name: 'Automad::getPagelist()', desc: 'Get filtered page list' },
      { name: 'Page::get()', desc: 'Get page field value' },
      { name: 'Page::getAll()', desc: 'Get all page fields' },
      { name: 'File::resize()', desc: 'Resize image' },
      { name: 'Shared::get()', desc: 'Get shared field' },
    ],
  },
  rest: {
    title: 'REST API',
    url: '/developer-guide/api-reference',
    description: 'Headless REST API endpoints',
    endpoints: [
      { name: 'GET /api/pages', desc: 'List all pages' },
      { name: 'GET /api/pages/:slug', desc: 'Get single page' },
      { name: 'GET /api/search', desc: 'Search pages' },
      { name: 'GET /api/files', desc: 'List files' },
      { name: 'GET /api/tags', desc: 'List all tags' },
      { name: 'POST /api/auth/login', desc: 'Authenticate user' },
    ],
  },
  webhooks: {
    title: 'Webhooks',
    url: '/developer-guide/api-reference',
    description: 'HTTP callbacks for events',
    endpoints: [
      { name: 'page.created', desc: 'Triggered when page is created' },
      { name: 'page.updated', desc: 'Triggered when page is modified' },
      { name: 'page.deleted', desc: 'Triggered when page is deleted' },
      { name: 'form.submitted', desc: 'Triggered when form is submitted' },
    ],
  },
};

/**
 * Get API documentation for Automad v2
 */
export function getApiDocs(input: ApiDocsInput): string {
  const { type } = input;

  if (type !== 'all' && API_DOCS[type]) {
    return formatApiDoc(type, API_DOCS[type as keyof typeof API_DOCS]);
  }

  const lines: string[] = [
    '## Automad v2 API Reference\n',
    `Source: ${BASE_URL}/developer-guide/api-reference\n`,
    '---\n',
  ];

  for (const [, api] of Object.entries(API_DOCS)) {
    lines.push(`### ${api.title}\n`);
    lines.push(`${api.description}\n`);
    lines.push(`[Documentation](${BASE_URL}${api.url})\n`);
    lines.push('| Endpoint | Description |');
    lines.push('|----------|-------------|');
    for (const ep of api.endpoints) {
      lines.push(`| \`${ep.name}\` | ${ep.desc} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatApiDoc(type: string, api: (typeof API_DOCS)[keyof typeof API_DOCS]): string {
  const lines: string[] = [
    `## ${api.title}\n`,
    `${api.description}\n`,
    `Source: ${BASE_URL}${api.url}\n`,
    '---\n',
    '### Endpoints\n',
    '| Endpoint | Description |',
    '|----------|-------------|',
  ];

  for (const ep of api.endpoints) {
    lines.push(`| \`${ep.name}\` | ${ep.desc} |`);
  }

  return lines.join('\n');
}

// Export for testing
export const apiTypes = Object.keys(API_DOCS);
