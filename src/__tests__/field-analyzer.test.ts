import { describe, it, expect } from 'vitest';
import { analyzeFields } from '../tools/field-analyzer.js';

describe('analyzeFields', () => {
  it('returns a string', async () => {
    const result = await analyzeFields({});
    expect(typeof result).toBe('string');
  });

  it('contains field analysis info', async () => {
    const result = await analyzeFields({});
    expect(result).toContain('Field');
  });

  it('mentions common field types', async () => {
    const result = await analyzeFields({});
    const hasFieldType =
      result.includes('+') || result.includes('text') || result.includes('Field');
    expect(hasFieldType).toBe(true);
  });

  it('handles theme path parameter', async () => {
    const result = await analyzeFields({ themePath: '/nonexistent' });
    expect(typeof result).toBe('string');
  });
});
