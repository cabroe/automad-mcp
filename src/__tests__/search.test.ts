import { describe, it, expect } from 'vitest';
import { searchDocs } from '../tools/search.js';

describe('searchDocs', () => {
  it('returns a string', () => {
    const result = searchDocs({ query: 'template' });
    expect(typeof result).toBe('string');
  });

  it('contains search term in results', () => {
    const result = searchDocs({ query: 'template' });
    expect(result.toLowerCase()).toContain('template');
  });

  it('returns ranked results', () => {
    const result = searchDocs({ query: 'pagelist' });
    expect(result).toContain('pagelist');
  });

  it('handles special characters', () => {
    const result = searchDocs({ query: '@{}' });
    expect(typeof result).toBe('string');
  });

  it('includes URLs in results', () => {
    const result = searchDocs({ query: 'theme' });
    expect(result).toContain('automad.org');
  });
});
