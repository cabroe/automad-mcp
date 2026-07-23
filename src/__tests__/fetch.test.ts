import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from '../utils/fetch.js';

describe('fetchWithRetry', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('returns successful response on first try', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'content',
      headers: new Headers(),
    };
    mockFetch.mockResolvedValueOnce(response);

    const result = await fetchWithRetry({ url: 'https://example.com' });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 server error', async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
      headers: new Headers(),
    };
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'content',
      headers: new Headers(),
    };

    mockFetch.mockResolvedValueOnce(errorResponse).mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetry({ url: 'https://example.com', retries: 3, delayMs: 10 });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 rate limit', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => '',
      headers: new Headers(),
    };
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'content',
      headers: new Headers(),
    };

    mockFetch.mockResolvedValueOnce(rateLimitResponse).mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetry({ url: 'https://example.com', retries: 3, delayMs: 10 });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404', async () => {
    const notFoundResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '',
      headers: new Headers(),
    };
    mockFetch.mockResolvedValueOnce(notFoundResponse);

    const result = await fetchWithRetry({ url: 'https://example.com', retries: 3 });

    expect(result.status).toBe(404);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on network error', async () => {
    const networkError = new Error('Network error');
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'content',
      headers: new Headers(),
    };

    mockFetch.mockRejectedValueOnce(networkError).mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetry({ url: 'https://example.com', retries: 3, delayMs: 10 });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns last error response after exhausting retries', async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
      headers: new Headers(),
    };
    mockFetch.mockResolvedValue(errorResponse);

    // After exhausting retries, returns the last (error) response
    const result = await fetchWithRetry({ url: 'https://example.com', retries: 2, delayMs: 1 });

    expect(result.status).toBe(500);
    // 1 initial + 2 retries = 3 calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('uses exponential backoff', async () => {
    vi.useFakeTimers();

    const errorResponse = {
      ok: false,
      status: 500,
      statusText: 'Error',
      text: async () => '',
      headers: new Headers(),
    };
    const successResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => 'content',
      headers: new Headers(),
    };

    mockFetch
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry({ url: 'https://example.com', retries: 3, delayMs: 100 });

    // Wait for backoff delays
    await vi.advanceTimersByTimeAsync(100); // 1st retry: 100ms
    await vi.advanceTimersByTimeAsync(200); // 2nd retry: 200ms

    const result = await promise;
    expect(result.ok).toBe(true);

    vi.useRealTimers();
  });
});
