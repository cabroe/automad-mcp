import { describe, it, expect } from 'vitest';
import { generateTheme } from '../tools/theme-generator.js';

describe('generateTheme', () => {
  it('returns a string', async () => {
    const result = await generateTheme({ template: 'starter', author: 'Test' });
    expect(typeof result).toBe('string');
  });

  it('returns error when directory exists', async () => {
    // Try to generate in existing directory
    const result = await generateTheme({ template: 'starter', author: 'Test' });
    expect(result).toContain('Error');
    expect(result).toContain('exists');
  });
});
