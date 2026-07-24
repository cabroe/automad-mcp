import { describe, it, expect } from 'vitest';
import { themeCheck } from '../tools/theme-checks.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Uses the bundled my-theme fixture shipped with the repo. Resolve from this
// test file so the path works identically on Windows, macOS and Linux CI.
const __dirname = dirname(fileURLToPath(import.meta.url));
const THEME_PATH = resolve(__dirname, '../../my-theme/my-theme');

describe('themeCheck', () => {
  it('runs without throwing on a real theme directory', async () => {
    // Regression test for the bug where theme-checks used CommonJS `require('fs')`
    // in an ESM project and threw `require is not defined` before any checks ran.
    const result = await themeCheck({ themePath: THEME_PATH, check: 'all' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Theme Check Results');
  });

  it('runs the schema check subset without throwing', async () => {
    const result = await themeCheck({ themePath: THEME_PATH, check: 'schema' });
    expect(typeof result).toBe('string');
    expect(result).toContain('Theme Check Results');
  });

  it('runs the a11y check subset without throwing', async () => {
    const result = await themeCheck({ themePath: THEME_PATH, check: 'a11y' });
    expect(typeof result).toBe('string');
    expect(result).toContain('Theme Check Results');
  });

  it('runs the seo check subset without throwing', async () => {
    const result = await themeCheck({ themePath: THEME_PATH, check: 'seo' });
    expect(typeof result).toBe('string');
    expect(result).toContain('Theme Check Results');
  });

  it('reports a clean theme-not-found error when path is invalid', async () => {
    const result = await themeCheck({ themePath: '/nonexistent/path/xyz', check: 'all' });
    expect(result).toContain('Theme not found');
  });
});
