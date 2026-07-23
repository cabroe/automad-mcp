import { describe, it, expect } from 'vitest';
import { generateI18n } from '../tools/i18n-generator.js';

describe('generateI18n', () => {
  it('returns i18n pattern guide when no path provided', async () => {
    const result = await generateI18n({});
    expect(result).toContain('i18n Pattern Guide');
    expect(result).toContain('Per-Tree');
    expect(result).toContain('Per-Field');
    expect(result).toContain('Mixed');
  });

  it('explains per-tree pattern', async () => {
    const result = await generateI18n({ pattern: 'per-tree' });
    expect(result).toContain('Per-Tree');
    expect(result).toContain('pages/');
  });

  it('explains per-field pattern', async () => {
    const result = await generateI18n({ pattern: 'per-field' });
    expect(result).toContain('Per-Field');
    expect(result).toContain('textHeroTitle_de');
  });

  it('explains mixed pattern', async () => {
    const result = await generateI18n({ pattern: 'mixed' });
    expect(result).toContain('Mixed');
    expect(result).toContain('SEO');
  });

  it('contains comparison table', async () => {
    const result = await generateI18n({});
    expect(result).toContain('Vergleich');
    expect(result).toContain('SEO');
    expect(result).toContain('Aufwand');
  });

  it('contains setup instructions', async () => {
    const result = await generateI18n({});
    expect(result).toContain('Setup');
    expect(result).toContain('Dashboard');
  });

  it('generates skeleton with generate flag', async () => {
    const result = await generateI18n({ generate: true, languages: 'de,en' });
    expect(result).toContain('i18n.php Skeleton');
    expect(result).toContain('nav.products');
  });
});
