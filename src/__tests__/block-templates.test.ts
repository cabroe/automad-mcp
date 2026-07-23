import { describe, it, expect } from 'vitest';
import { getBlockTemplates, getBlockTemplate, blockTypes } from '../tools/block-templates.js';

describe('getBlockTemplates', () => {
  it('returns a string', async () => {
    const result = await getBlockTemplates({ type: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains block template info', async () => {
    const result = await getBlockTemplates({ type: 'all' });
    expect(result).toContain('Block Templates');
    expect(result).toContain('Verfügbare');
  });

  it('lists pagelist templates', async () => {
    const result = await getBlockTemplates({ type: 'pagelist' });
    expect(result).toContain('Pagelist');
    expect(result).toContain('grid');
  });

  it('contains usage instructions', async () => {
    const result = await getBlockTemplates({ type: 'all' });
    expect(result).toContain('Verwendung');
    expect(result).toContain('blocks/');
  });
});

describe('getBlockTemplate', () => {
  it('returns pagelist grid template', async () => {
    const result = await getBlockTemplate({ type: 'pagelist', variant: 'grid' });
    expect(result).toContain('Block Template');
    expect(result).toContain('grid');
    expect(result).toContain('```php');
  });

  it('returns error for non-existent template', async () => {
    const result = await getBlockTemplate({ type: 'nonexistent', variant: 'fake' });
    expect(result).toContain('nicht gefunden');
    expect(result).toContain('nonexistent');
  });
});

describe('blockTypes', () => {
  it('exports expected block types', () => {
    expect(blockTypes).toContain('pagelist');
    expect(blockTypes).toContain('sections');
  });
});
