import { describe, it, expect } from 'vitest';
import { getSnippets, getSnippetCategories } from '../tools/snippets.js';

describe('getSnippets', () => {
  it('returns a string', () => {
    const result = getSnippets({ category: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains snippet code', () => {
    const result = getSnippets({ category: 'all' });
    expect(result).toContain('```');
  });

  it('filters by category', () => {
    const result = getSnippets({ category: 'template' });
    expect(result).toContain('template');
    expect(result).toContain('@{');
  });

  it('filters by search term', () => {
    const result = getSnippets({ category: 'all', search: 'markdown' });
    expect(result.toLowerCase()).toContain('markdown');
  });

  it('returns info when no results', () => {
    const result = getSnippets({ category: 'all', search: 'xyznonexistent' });
    expect(result).toContain('No snippets found');
  });
});

describe('getSnippetCategories', () => {
  it('returns array of categories', () => {
    const categories = getSnippetCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('contains expected categories', () => {
    const categories = getSnippetCategories();
    expect(categories).toContain('template');
    expect(categories).toContain('block');
    expect(categories).toContain('layout');
  });
});
