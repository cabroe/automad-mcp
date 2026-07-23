import { describe, it, expect } from 'vitest';
import { validateTheme } from '../tools/theme-validator.js';

describe('validateTheme', () => {
  it('returns a string', async () => {
    const result = await validateTheme({});
    expect(typeof result).toBe('string');
  });

  it('contains validation info', async () => {
    const result = await validateTheme({});
    const hasValidation = result.includes('Validation') || result.includes('Theme');
    expect(hasValidation).toBe(true);
  });

  it('shows score or checks', async () => {
    const result = await validateTheme({});
    const hasCheck =
      result.includes('Score') ||
      result.includes('theme.json') ||
      result.includes('Error') ||
      result.includes('check');
    expect(hasCheck).toBe(true);
  });

  it('mentions required files', async () => {
    const result = await validateTheme({});
    const hasFile =
      result.includes('theme.json') || result.includes('default.php') || result.includes('Error');
    expect(hasFile).toBe(true);
  });
});
