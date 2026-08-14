import { BadRequestException, Injectable } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 5000;

@Injectable()
export class AvatarUrlValidator {
  async assertLoadableImage(url: string): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') ?? '';
      void response.body?.cancel?.();

      if (!response.ok || !contentType.startsWith('image/')) {
        throw new BadRequestException(['A URL do avatar precisa apontar para uma imagem válida']);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(['A URL do avatar precisa apontar para uma imagem válida']);
    } finally {
      clearTimeout(timeout);
    }
  }
}
