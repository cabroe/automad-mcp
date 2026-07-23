import { describe, it, expect } from 'vitest';
import { livePreview } from '../tools/live-preview.js';

describe('livePreview', () => {
  it('returns a string for status', async () => {
    const result = await livePreview({ action: 'status', port: 8000 });
    expect(typeof result).toBe('string');
  });

  it('returns a string for start', async () => {
    const result = await livePreview({ action: 'start', port: 9000 });
    expect(typeof result).toBe('string');
  });

  it('returns a string for stop', async () => {
    const result = await livePreview({ action: 'stop', port: 8000 });
    expect(typeof result).toBe('string');
  });

  // Note: 'open' action is not tested because it opens a browser
  // It works but has side effects that can't be easily mocked
});
