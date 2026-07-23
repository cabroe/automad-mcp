interface FetchOptions {
  url: string;
  retries?: number;
  delayMs?: number;
  timeoutMs?: number;
}

interface FetchResult {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
  headers: Headers;
}

/**
 * Fetch with automatic retry on network failure.
 * Retries on: network errors, 500-599 server errors, 429 rate limit.
 */
export async function fetchWithRetry(options: FetchOptions): Promise<FetchResult> {
  const { url, retries = 3, delayMs = 1000, timeoutMs = 15000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'automad-mcp/1.0 (MCP documentation server; https://github.com/cabroe/automad-mcp)',
          Accept: 'text/html,text/plain',
        },
      });

      clearTimeout(timeoutId);

      // Success or client error (4xx) - return as-is
      if (response.status < 500 && response.status !== 429) {
        return response;
      }

      // Server error (5xx) or rate limit (429) - retry
      if (attempt < retries) {
        lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
        await sleep(delayMs * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Abort/timeout - retry
      if (lastError.name === 'AbortError' || lastError.message.includes('aborted')) {
        if (attempt < retries) {
          await sleep(delayMs * Math.pow(2, attempt));
          continue;
        }
        throw new Error(`Request timeout after ${retries + 1} attempts`);
      }

      // Network error - retry
      if (attempt < retries) {
        await sleep(delayMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
