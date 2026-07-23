import { describe, it, expect } from 'vitest';
import { livePreview } from '../tools/live-preview.js';

describe('livePreview', () => {
  it('returns a string', async () => {
    const result = await livePreview({ action: 'status', port: 8000 });
    expect(typeof result).toBe('string');
  });

  it('handles status action', async () => {
    const result = await livePreview({ action: 'status', port: 8000 });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('handles start action', async () => {
    const result = await livePreview({ action: 'start', port: 9000 });
    expect(typeof result).toBe('string');
  });

  it('handles stop action', async () => {
    const result = await livePreview({ action: 'stop', port: 8000 });
    expect(typeof result).toBe('string');
  });

  it('handles open action', async () => {
    const result = await livePreview({ action: 'open', port: 8000 });
    expect(typeof result).toBe('string');
  });
});
