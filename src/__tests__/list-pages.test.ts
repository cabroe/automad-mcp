import { describe, it, expect } from 'vitest';
import { listPages } from '../tools/list-pages.js';
import { PAGES, BASE_URL } from '../utils/pages.js';

describe('listPages', () => {
  it('returns a string', () => {
    const result = listPages({});
    expect(typeof result).toBe('string');
  });

  it('contains the site root link and brand', () => {
    const result = listPages({});
    expect(result).toContain('Automad');
    expect(result).toContain(BASE_URL);
  });

  it('can filter by section', () => {
    const result = listPages({ section: 'developer-guide' });
    expect(result).toContain('Developer Guide');
    expect(result).toContain('Template Language');
  });

  it('every PAGES entry has a unique URL and is reachable from listPages', () => {
    const urls = PAGES.map(p => p.url);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);

    const output = listPages({});
    for (const page of PAGES.slice(0, 10)) {
      expect(output).toContain(`${BASE_URL}${page.url}`);
    }
  });
});