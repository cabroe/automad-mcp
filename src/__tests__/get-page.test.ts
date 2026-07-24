import { describe, it, expect } from 'vitest';
import { getPage } from '../tools/get-page.js';
import { PAGES, BASE_URL } from '../utils/pages.js';

describe('getPage', () => {
  // Pick a representative, fast-loading page (the root has minimal markup).
  const knownGoodUrl = `${BASE_URL}${PAGES[0].url}`; // "/"

  it('fetches a known-good URL successfully', async () => {
    const result = await getPage({ url: knownGoodUrl });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(50);
    expect(result.toLowerCase()).toContain('automad');
  });

  it('accepts full and relative URLs for the same page', async () => {
    const rel = await getPage({ url: '/' });
    const full = await getPage({ url: knownGoodUrl });
    // Both must yield content (different header is fine).
    expect(typeof rel).toBe('string');
    expect(typeof full).toBe('string');
    expect(rel.length).toBeGreaterThan(50);
    expect(full.length).toBeGreaterThan(50);
  });

  it('rejects non-automad.org URLs', async () => {
    await expect(getPage({ url: 'https://example.com/foo' })).rejects.toThrow(
      /automad\.org/
    );
  });
});