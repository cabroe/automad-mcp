import { describe, it, expect } from 'vitest';
import { SECTIONS } from '../utils/pages.js';
import { listPages } from '../tools/list-pages.js';

describe('listPages', () => {
  it('returns a string', () => {
    const result = listPages({ section: undefined });
    expect(typeof result).toBe('string');
  });

  it('contains Automad documentation links', () => {
    const result = listPages({ section: undefined });
    expect(result).toContain('automad.org');
  });

  it('contains section headers', () => {
    const result = listPages({ section: undefined });
    expect(result).toContain('Getting Started');
    expect(result).toContain('Developer Guide');
  });

  it('can filter by section', () => {
    const result = listPages({ section: 'getting-started' });
    expect(result).toContain('Getting Started');
  });

  it('includes Developer Guide section', () => {
    const result = listPages({ section: 'developer-guide' });
    expect(result).toContain('Developer Guide');
  });

  it('returns available sections', () => {
    expect(SECTIONS).toBeDefined();
    expect(Array.isArray(SECTIONS)).toBe(true);
    expect(SECTIONS.length).toBeGreaterThan(0);
  });
});
