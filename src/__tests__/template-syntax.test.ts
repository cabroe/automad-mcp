import { describe, it, expect } from 'vitest';
import { getTemplateSyntax } from '../tools/template-syntax.js';

describe('getTemplateSyntax', () => {
  it('returns a string', () => {
    const result = getTemplateSyntax({ type: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains syntax reference', () => {
    const result = getTemplateSyntax({ type: 'all' });
    expect(result).toContain('Syntax Reference');
  });

  it('explains statements with <@ @>', () => {
    const result = getTemplateSyntax({ type: 'statements' });
    expect(result).toContain('<@');
    expect(result).toContain('@>');
  });

  it('explains variables with @{ }', () => {
    const result = getTemplateSyntax({ type: 'variables' });
    expect(result).toContain('@{');
  });

  it('explains blocks with @{ + }', () => {
    const result = getTemplateSyntax({ type: 'blocks' });
    expect(result).toContain('@{ +');
    expect(result).toContain('Ohne'); // German lowercase
  });

  it('contains debugging section', () => {
    const result = getTemplateSyntax({ type: 'debug' });
    expect(result).toContain('Debug');
    expect(result).toContain('Cache');
  });

  it('shows minimal theme example', () => {
    const result = getTemplateSyntax({ type: 'debug' });
    expect(result).toContain('Minimal funktionierendes Theme');
    expect(result).toContain('theme.json');
  });
});
