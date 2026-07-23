import { describe, it, expect } from 'vitest';
import { parseArgs } from '../utils/config.js';

describe('parseArgs', () => {
  it('parses verbose flag -v', () => {
    const { config } = parseArgs(['-v']);
    expect(config.verbose).toBe(true);
  });

  it('parses verbose flag --verbose', () => {
    const { config } = parseArgs(['--verbose']);
    expect(config.verbose).toBe(true);
  });

  it('parses cache-dir', () => {
    const { config } = parseArgs(['--cache-dir', '/custom/path']);
    expect(config.cacheDir).toBe('/custom/path');
  });

  it('parses theme-path', () => {
    const { config } = parseArgs(['--theme-path', '/my/theme']);
    expect(config.themePath).toBe('/my/theme');
  });

  it('parses --no-cache', () => {
    const { config } = parseArgs(['--no-cache']);
    expect(config.cacheTtlMs).toBe(0);
  });

  it('returns remaining non-flag arguments', () => {
    const { remaining } = parseArgs(['some-arg', '-v', 'another-arg']);
    expect(remaining).toEqual(['some-arg', 'another-arg']);
  });
});
