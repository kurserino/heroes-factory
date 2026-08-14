import { BadRequestException } from '@nestjs/common';
import { AvatarUrlValidator } from '../../src/heroes/avatar-url-validator';

// Minimal fetch stub — avoids pulling in a mocking library for a single
// collaborator, consistent with keeping dependencies intentional.
function stubFetch(overrides: Partial<Response>): void {
  const response = {
    ok: true,
    headers: new Headers({ 'content-type': 'image/png' }),
    body: { cancel: async () => undefined },
    ...overrides,
  } as unknown as Response;
  global.fetch = (async () => response) as typeof fetch;
}

describe('AvatarUrlValidator', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('resolves when the URL responds 2xx with an image content-type', async () => {
    stubFetch({ ok: true, headers: new Headers({ 'content-type': 'image/jpeg' }) });
    const validator = new AvatarUrlValidator();

    await expect(
      validator.assertLoadableImage('https://example.com/avatar.jpg'),
    ).resolves.toBeUndefined();
  });

  it('rejects when the response is not ok', async () => {
    stubFetch({ ok: false, headers: new Headers({ 'content-type': 'image/png' }) });
    const validator = new AvatarUrlValidator();

    await expect(
      validator.assertLoadableImage('https://example.com/missing.png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the content-type is not an image', async () => {
    stubFetch({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) });
    const validator = new AvatarUrlValidator();

    await expect(
      validator.assertLoadableImage('https://example.com/page.html'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the fetch itself throws (e.g. unreachable host)', async () => {
    global.fetch = (async () => {
      throw new Error('network error');
    }) as typeof fetch;
    const validator = new AvatarUrlValidator();

    await expect(
      validator.assertLoadableImage('https://unreachable.example/avatar.png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
