import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStarterKitFileInputSchema } from '../tools/get-starter-kit-file.js';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getStarterKitFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Schema Validation', () => {
    it('accepts valid path parameter', () => {
      const result = getStarterKitFileInputSchema.safeParse({ path: 'README.md' });
      expect(result.success).toBe(true);
    });

    it('accepts valid file parameter (alias)', () => {
      const result = getStarterKitFileInputSchema.safeParse({ file: 'README.md' });
      expect(result.success).toBe(true);
    });

    it('accepts both path and file parameters', () => {
      const result = getStarterKitFileInputSchema.safeParse({ path: 'theme.json', file: 'README.md' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('theme.json');
      }
    });

    it('prefers path over file when both provided', () => {
      const result = getStarterKitFileInputSchema.safeParse({ path: 'theme.json', file: 'README.md' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('theme.json');
      }
    });

    it('uses file as fallback when path is missing', () => {
      const result = getStarterKitFileInputSchema.safeParse({ file: 'package.json' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('package.json');
      }
    });

    it('rejects empty string for path', () => {
      const result = getStarterKitFileInputSchema.safeParse({ path: '' });
      expect(result.success).toBe(false);
    });

    it('rejects empty string for file', () => {
      const result = getStarterKitFileInputSchema.safeParse({ file: '' });
      expect(result.success).toBe(false);
    });

    it('accepts empty object and transforms to empty path', () => {
      const result = getStarterKitFileInputSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('');
      }
    });
  });

  describe('getStarterKitFile function', () => {
    it('fetches file from GitHub successfully', async () => {
      const { getStarterKitFile } = await import('../tools/get-starter-kit-file.js');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '# Test Content',
        headers: new Headers(),
      });

      const result = await getStarterKitFile({ path: 'README.md' });
      
      expect(result).toContain('**File**: `README.md`');
      expect(result).toContain('**Source**:');
      expect(result).toContain('```markdown');
      expect(result).toContain('# Test Content');
    });

    it('returns error message for 404', async () => {
      const { getStarterKitFile } = await import('../tools/get-starter-kit-file.js');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found',
        headers: new Headers(),
      });

      const result = await getStarterKitFile({ path: 'nonexistent.md' });
      
      expect(result).toContain('File not found');
      expect(result).toContain('nonexistent.md');
    });

    it('handles PHP files with correct syntax highlighting', async () => {
      const { getStarterKitFile } = await import('../tools/get-starter-kit-file.js');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<?php\necho "Hello";',
        headers: new Headers(),
      });

      const result = await getStarterKitFile({ path: 'default.php' });
      
      expect(result).toContain('```php');
    });

    it('handles JSON files with correct syntax highlighting', async () => {
      const { getStarterKitFile } = await import('../tools/get-starter-kit-file.js');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '{"name": "test"}',
        headers: new Headers(),
      });

      const result = await getStarterKitFile({ path: 'theme.json' });
      
      expect(result).toContain('```json');
    });

    it('handles binary files gracefully', async () => {
      const { getStarterKitFile } = await import('../tools/get-starter-kit-file.js');
      
      const result = await getStarterKitFile({ path: 'image.png' });
      
      expect(result).toContain('not supported');
      expect(result).toContain('png');
    });
  });
});
