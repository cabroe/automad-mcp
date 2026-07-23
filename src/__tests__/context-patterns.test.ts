import { describe, it, expect } from 'vitest';
import { getContextPatterns, contextTypes } from '../tools/context-patterns.js';

describe('getContextPatterns', () => {
  it('returns a string', () => {
    const result = getContextPatterns({ type: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains set pattern', () => {
    const result = getContextPatterns({ type: 'set' });
    expect(result).toContain('set');
    expect(result).toContain('<@ set');
  });

  it('contains with pattern', () => {
    const result = getContextPatterns({ type: 'with' });
    expect(result).toContain('with');
    expect(result).toContain(':file');
    expect(result).toContain(':fileResized');
  });

  it('contains foreach pattern', () => {
    const result = getContextPatterns({ type: 'foreach' });
    expect(result).toContain('foreach');
    expect(result).toContain(':url');
    expect(result).toContain(':title');
  });

  it('contains recursive pattern', () => {
    const result = getContextPatterns({ type: 'recursive' });
    expect(result).toContain('Rekursiv');
    expect(result).toContain(':current');
    expect(result).toContain(':currentPath');
  });

  it('returns all patterns combined', () => {
    const result = getContextPatterns({ type: 'all' });
    expect(result).toContain('set');
    expect(result).toContain('with');
    expect(result).toContain('foreach');
    expect(result).toContain('Rekursiv');
  });

  it('warns about current vs currentPath', () => {
    const result = getContextPatterns({ type: 'recursive' });
    expect(result).toContain(':current');
    expect(result).toContain(':currentPath');
    expect(result).toContain('aktuelle Seite');
  });
});

describe('contextTypes', () => {
  it('exports expected types', () => {
    expect(contextTypes).toContain('all');
    expect(contextTypes).toContain('set');
    expect(contextTypes).toContain('with');
    expect(contextTypes).toContain('foreach');
    expect(contextTypes).toContain('recursive');
  });
});
