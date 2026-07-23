import { describe, it, expect } from 'vitest';
import { listStarterKitFiles } from '../tools/list-starter-kit-files.js';

describe('listStarterKitFiles', () => {
  it('returns a string', () => {
    const result = listStarterKitFiles({ directory: undefined });
    expect(typeof result).toBe('string');
  });

  it('contains README.md', () => {
    const result = listStarterKitFiles({ directory: undefined });
    expect(result).toContain('README.md');
  });

  it('contains theme.json', () => {
    const result = listStarterKitFiles({ directory: undefined });
    expect(result).toContain('theme.json');
  });

  it('contains GitHub links', () => {
    const result = listStarterKitFiles({ directory: undefined });
    expect(result).toContain('github.com');
  });

  it('includes directory listings', () => {
    const result = listStarterKitFiles({ directory: undefined });
    expect(result).toContain('components');
    expect(result).toContain('client');
  });

  it('can filter by directory', () => {
    const result = listStarterKitFiles({ directory: 'lib' });
    expect(result).toContain('lib');
  });

  it('filters bin directory', () => {
    const result = listStarterKitFiles({ directory: 'bin' });
    expect(result).toContain('bin');
  });
});
