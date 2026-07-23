import { describe, it, expect } from 'vitest';
import { getBlockLayouts } from '../tools/block-layouts.js';

describe('getBlockLayouts', () => {
  it('returns a string', () => {
    const result = getBlockLayouts({ type: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains block layout info', () => {
    const result = getBlockLayouts({ type: 'all' });
    expect(result).toContain('Block Layout');
  });

  it('contains code blocks', () => {
    const result = getBlockLayouts({ type: 'all' });
    expect(result).toContain('```');
  });

  it('filters by type', () => {
    const result = getBlockLayouts({ type: 'hero' });
    expect(result).toContain('Hero');
    expect(result).toContain('```');
  });

  it('contains layout type info', () => {
    const result = getBlockLayouts({ type: 'all' });
    expect(result).toContain('gallery');
    expect(result).toContain('faq');
  });
});
