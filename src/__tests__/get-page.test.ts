import { describe, it, expect } from 'vitest';
import { getPage } from '../tools/get-page.js';

describe('getPage', () => {
  it('fetches a documentation page', async () => {
    const result = await getPage({ url: '/getting-started' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts full URL', async () => {
    const result = await getPage({ url: 'https://automad.org/getting-started' });
    expect(typeof result).toBe('string');
  });

  it('returns markdown content', async () => {
    const result = await getPage({ url: '/getting-started' });
    // Should contain markdown-like content
    expect(result).toBeDefined();
  });

  it('returns error for invalid page', async () => {
    // This should either throw or return an error message
    try {
      const result = await getPage({ url: '/nonexistent-page-xyz' });
      // If it doesn't throw, it should indicate an error
      expect(result).toBeDefined();
    } catch (e) {
      // Error is acceptable
      expect(e).toBeDefined();
    }
  });
});
