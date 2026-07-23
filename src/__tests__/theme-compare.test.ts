import { describe, it, expect } from 'vitest';
import { compareThemes } from '../tools/theme-compare.js';

describe('compareThemes', () => {
  it('returns a string', async () => {
    const result = await compareThemes({ starterKitAsBase: true });
    expect(typeof result).toBe('string');
  });

  it('contains comparison info', async () => {
    const result = await compareThemes({ starterKitAsBase: true });
    expect(result).toContain('Theme Comparison');
    expect(result).toContain('Starter Kit');
  });

  it('mentions theme.json', async () => {
    const result = await compareThemes({ starterKitAsBase: true });
    expect(result).toContain('theme.json');
  });

  it('shows structure differences', async () => {
    const result = await compareThemes({ starterKitAsBase: true });
    expect(result).toContain('structure');
    expect(result).toContain('Missing');
  });

  it('handles starter kit as base', async () => {
    const result = await compareThemes({ starterKitAsBase: true });
    expect(result).toContain('Starter Kit');
  });
});
