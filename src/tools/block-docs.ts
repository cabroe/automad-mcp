import { z } from 'zod';
import { BASE_URL } from '../utils/pages.js';

export const blockDocsInputSchema = z.object({
  type: z
    .enum([
      'all',
      'text',
      'image',
      'gallery',
      'pagelist',
      'section',
      'columns',
      'button',
      'quote',
      'code',
      'divider',
      'video',
      'embed',
      'rss-feed',
    ])
    .optional()
    .default('all')
    .describe('Block type'),
});

export type BlockDocsInput = z.infer<typeof blockDocsInputSchema>;

const BLOCK_DOCS: Record<string, { title: string; description: string; props: string[] }> = {
  text: {
    title: 'Text Block',
    description: 'Rich text content with Markdown support',
    props: ['content (markdown)', 'alignment'],
  },
  image: {
    title: 'Image Block',
    description: 'Single image with optional caption and link',
    props: ['image', 'caption', 'link', 'alt'],
  },
  gallery: {
    title: 'Gallery Block',
    description: 'Grid or slideshow of images',
    props: ['images', 'layout (grid/slideshow)', 'columns', 'spacing'],
  },
  pagelist: {
    title: 'Pagelist Block',
    description: 'List of child pages or filtered pages',
    props: ['type (children/tags/search)', 'filter', 'sort', 'limit', 'template'],
  },
  section: {
    title: 'Section Block',
    description: 'Full-width container for grouping blocks',
    props: ['background', 'padding', 'content'],
  },
  columns: {
    title: 'Columns Block',
    description: 'Multi-column layout container',
    props: ['columns (2-4)', 'gap', 'alignment'],
  },
  button: {
    title: 'Button Block',
    description: 'Call-to-action button',
    props: ['url', 'label', 'style (primary/secondary)', 'icon'],
  },
  quote: {
    title: 'Quote Block',
    description: 'Blockquote with optional author',
    props: ['text', 'author', 'alignment'],
  },
  code: {
    title: 'Code Block',
    description: 'Syntax-highlighted code snippet',
    props: ['language', 'code', 'line-numbers'],
  },
  divider: {
    title: 'Divider Block',
    description: 'Horizontal separator',
    props: ['style (line/dots/space)'],
  },
  video: {
    title: 'Video Block',
    description: 'Embedded video player',
    props: ['url (mp4/webm)', 'poster', 'autoplay', 'loop'],
  },
  embed: {
    title: 'Embed Block',
    description: 'Embed external content (YouTube, Vimeo, etc.)',
    props: ['url', 'aspect-ratio'],
  },
  'rss-feed': {
    title: 'RSS Feed Block',
    description: 'Display RSS/Atom feed content',
    props: ['feed-url', 'limit', 'template'],
  },
};

/**
 * Get documentation for Automad v2 block types
 */
export function getBlockDocs(input: BlockDocsInput): string {
  const { type } = input;

  if (type !== 'all' && BLOCK_DOCS[type]) {
    return formatBlockDoc(type, BLOCK_DOCS[type]);
  }

  const lines: string[] = [
    '## Automad v2 Block Reference\n',
    // The Automad docs do not expose a dedicated /blocks page. The closest
    // live references are the user-guide "Using Blocks" article and the
    // developer-guide pages for customizing / laying out blocks.
    `Source: ${BASE_URL}/user-guide/using-blocks\n`,
    '---\n',
  ];

  for (const [key, block] of Object.entries(BLOCK_DOCS)) {
    lines.push(`### ${block.title}\n`);
    lines.push(`**${block.description}**\n`);
    lines.push('```');
    lines.push(`get_block_docs({ type: '${key}' })`);
    lines.push('```\n');
  }

  return lines.join('\n');
}

function formatBlockDoc(
  type: string,
  block: { title: string; description: string; props: string[] }
): string {
  return [
    `## ${block.title}\n`,
    `**Type:** \`${type}\`\n`,
    `\n${block.description}\n`,
    '\n### Properties\n',
    ...block.props.map(p => `- ${p}`),
    '\n---\n',
    `\n[Back to all blocks](${BASE_URL}/user-guide/using-blocks)\n`,
  ].join('\n');
}

// Export for testing
export const blockTypes = Object.keys(BLOCK_DOCS);
