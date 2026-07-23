import { describe, it, expect } from 'vitest';
import { listPages } from '../tools/list-pages.js';

describe('listPages', () => {
  it('returns a string', () => {
    const result = listPages({});
    expect(typeof result).toBe('string');
  });

  it('contains Version 2', () => {
    const result = listPages({});
    expect(result).toContain('Version 2');
    expect(result).toContain('automad.org');
  });

  it('can filter by section', () => {
    const result = listPages({ section: 'version-2' });
    expect(result).toContain('Version 2');
    expect(result).toContain('Getting Started');
  });
});
