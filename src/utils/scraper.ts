// @ts-nocheck - node-html-parser has incomplete types
import { parse, HTMLElement } from 'node-html-parser';
import { BASE_URL } from './pages.js';
import { fetchWithRetry } from './fetch.js';

interface CacheEntry {
  content: string;
  timestamp: number;
}

export const cache = new Map<string, CacheEntry>();
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches and converts an Automad documentation page to clean Markdown.
 * Results are cached in memory for 1 hour.
 */
export async function fetchPage(urlOrPath: string): Promise<string> {
  const url = normalizeUrl(urlOrPath);

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.content;
  }

  const response = await fetchWithRetry({ url, retries: 3, delayMs: 1000, timeoutMs: 15000 });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: HTTP ${response.status} ${response.statusText}. ` +
        `This may indicate a temporary server issue. Try again in a few minutes.`
    );
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html, url);

  cache.set(url, { content: markdown, timestamp: Date.now() });
  return markdown;
}

/**
 * Converts an Automad documentation HTML page to readable Markdown.
 */
function htmlToMarkdown(html: string, pageUrl: string): string {
  const root = parse(html);

  // Remove scripts, styles, nav, footer
  for (const el of root.querySelectorAll(
    'script, style, nav, footer, .docs-navbar, .docs-footer, .docs-sidebar, #docs-sidebar-modal, #docs-nav, .docs-banner'
  )) {
    el.remove();
  }

  // Try to get the main doc content
  const content =
    root.querySelector('.docs-content') ??
    root.querySelector('.uk-container') ??
    root.querySelector('main') ??
    root.querySelector('body');

  if (!content) {
    return '(No content found)';
  }

  const lines: string[] = [];
  lines.push(`> Source: ${pageUrl}\n`);
  lines.push(nodeToMarkdown(content).trim());

  return lines.join('\n');
}

function nodeToMarkdown(node: HTMLElement): string {
  const parts: string[] = [];

  for (const child of node.childNodes) {
    const tag = (child as HTMLElement).tagName?.toLowerCase() as string | undefined;

    if (!tag) {
      // Text node
      const text = child.text.replace(/\s+/g, ' ').trim();
      if (text) parts.push(text);
      continue;
    }

    switch (tag) {
      case 'h1':
        parts.push(`\n# ${child.text.trim()}\n`);
        break;
      case 'h2':
        parts.push(`\n## ${child.text.trim()}\n`);
        break;
      case 'h3':
        parts.push(`\n### ${child.text.trim()}\n`);
        break;
      case 'h4':
        parts.push(`\n#### ${child.text.trim()}\n`);
        break;
      case 'h5':
      case 'h6':
        parts.push(`\n##### ${child.text.trim()}\n`);
        break;
      case 'p':
        parts.push(`\n${nodeToMarkdown(child as HTMLElement).trim()}\n`);
        break;
      case 'br':
        parts.push('  \n');
        break;
      case 'strong':
      case 'b':
        parts.push(`**${child.text.trim()}**`);
        break;
      case 'em':
      case 'i':
        parts.push(`_${child.text.trim()}_`);
        break;
      case 'code': {
        const codeText = child.text;
        parts.push(`\`${codeText}\``);
        break;
      }
      case 'pre': {
        const codeEl = (child as HTMLElement).querySelector('code');
        const rawText = codeEl ? codeEl.text : child.text;
        // Strip any remaining HTML tags from the text content
        const codeContent = rawText.replace(/<[^>]+>/g, '').trim();
        const lang = getLang(codeEl);
        parts.push(`\n\`\`\`${lang}\n${codeContent}\n\`\`\`\n`);
        break;
      }
      case 'a': {
        const href = (child as HTMLElement).getAttribute('href') ?? '';
        const linkText = child.text.trim();
        const absoluteHref = href.startsWith('/') ? `${BASE_URL}${href}` : href;
        if (linkText) {
          parts.push(`[${linkText}](${absoluteHref})`);
        }
        break;
      }
      case 'ul':
      case 'ol': {
        parts.push('\n');
        const items = (child as HTMLElement).querySelectorAll('li');
        items.forEach((li: HTMLElement, i: number) => {
          const prefix = tag === 'ol' ? `${i + 1}.` : '-';
          parts.push(`${prefix} ${nodeToMarkdown(li).trim()}\n`);
        });
        parts.push('\n');
        break;
      }
      case 'li':
        // handled by ul/ol
        break;
      case 'table': {
        parts.push(tableToMarkdown(child as HTMLElement));
        break;
      }
      case 'blockquote': {
        const bqContent = nodeToMarkdown(child as HTMLElement)
          .trim()
          .split('\n')
          .map(l => `> ${l}`)
          .join('\n');
        parts.push(`\n${bqContent}\n`);
        break;
      }
      case 'hr':
        parts.push('\n---\n');
        break;
      case 'img':
        break; // skip images
      default:
        parts.push(nodeToMarkdown(child as HTMLElement));
    }
  }

  return parts.join('');
}

function getLang(codeEl: HTMLElement | null): string {
  if (!codeEl) return '';
  const cls: string = codeEl.getAttribute('class') ?? '';
  const match = cls.match(/language-(\w+)/);
  return match ? match[1] : '';
}

function tableToMarkdown(tableNode: HTMLElement): string {
  const rows: string[][] = [];

  for (const tr of tableNode.querySelectorAll('tr')) {
    const cells: string[] = [];
    for (const cell of tr.querySelectorAll('th, td')) {
      cells.push(cell.text.trim().replace(/\|/g, '\\|'));
    }
    rows.push(cells);
  }

  if (rows.length === 0) return '';

  const colCount = Math.max(...rows.map(r => r.length));
  const padded = rows.map(r => {
    while (r.length < colCount) r.push('');
    return r;
  });

  const header = `| ${padded[0].join(' | ')} |`;
  const separator = `| ${Array(colCount).fill('---').join(' | ')} |`;
  const body = padded
    .slice(1)
    .map(r => `| ${r.join(' | ')} |`)
    .join('\n');

  return `\n${header}\n${separator}\n${body}\n`;
}

function normalizeUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${BASE_URL}${path}`;
}
