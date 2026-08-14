const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorName: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
}

function toErrorMessage(body: ErrorBody): string {
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const body = (await response.json()) as unknown;

  if (!response.ok) {
    const errorBody = body as ErrorBody;
    throw new ApiError(
      errorBody.statusCode ?? response.status,
      errorBody.error ?? 'Error',
      toErrorMessage(errorBody),
    );
  }

  return body as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string): Promise<TResponse> => request<TResponse>(path),
  post: <TResponse>(path: string, data: unknown): Promise<TResponse> =>
    request<TResponse>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <TResponse>(path: string, data: unknown): Promise<TResponse> =>
    request<TResponse>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <TResponse>(path: string): Promise<TResponse> =>
    request<TResponse>(path, { method: 'DELETE' }),
};
