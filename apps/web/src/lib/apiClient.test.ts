import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from './apiClient';

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed body on a successful GET', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { id: '1' })));

    const result = await apiClient.get<{ id: string }>('/heroes/1');

    expect(result).toEqual({ id: '1' });
  });

  it('returns undefined for a 204 response without attempting to parse a body', async () => {
    const jsonSpy = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 204, ok: true, json: jsonSpy } as unknown as Response),
    );

    const result = await apiClient.delete<void>('/heroes/1');

    expect(result).toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('throws an ApiError with a joined message for a validation (array-message) error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: ['name should not be empty', 'avatar_url must resolve to a loadable image'],
        }),
      ),
    );

    await expect(apiClient.post('/heroes', {})).rejects.toMatchObject({
      statusCode: 400,
      errorName: 'Bad Request',
      message: 'name should not be empty, avatar_url must resolve to a loadable image',
    });
  });

  it('throws an ApiError with a plain message for a single-string error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(409, {
          statusCode: 409,
          error: 'Conflict',
          message: 'Cannot edit an inactive hero',
        }),
      ),
    );

    await expect(apiClient.patch('/heroes/1', {})).rejects.toBeInstanceOf(ApiError);
    await expect(apiClient.patch('/heroes/1', {})).rejects.toMatchObject({
      statusCode: 409,
      message: 'Cannot edit an inactive hero',
    });
  });
});
