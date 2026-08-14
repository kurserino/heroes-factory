import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AvatarUrlValidator } from '../../src/heroes/avatar-url-validator';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { PrismaService } from '../../src/prisma/prisma.service';

class FakeAvatarUrlValidator extends AvatarUrlValidator {
  async assertLoadableImage(url: string): Promise<void> {
    if (url.includes('bad-image')) {
      const { BadRequestException } = await import('@nestjs/common');
      throw new BadRequestException([
        'avatar_url must resolve to a loadable image',
      ]);
    }
  }
}

describe('Heroes API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const validCreateBody = {
    name: 'Peter Parker',
    nickname: 'Spider-Man',
    date_of_birth: '1995-08-10',
    universe: 'Marvel',
    main_power: 'Wall-crawling and spider-sense',
    avatar_url: 'https://example.com/avatars/spider-man.png',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AvatarUrlValidator)
      .useClass(FakeAvatarUrlValidator)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.hero.deleteMany();
  });

  afterAll(async () => {
    await prisma.hero.deleteMany();
    await app.close();
  });

  async function createHero(overrides: Partial<typeof validCreateBody> = {}) {
    const response = await request(app.getHttpServer())
      .post('/heroes')
      .send({ ...validCreateBody, ...overrides });
    return response;
  }

  it('POST /heroes creates a hero and returns 201 with the exact 10-field representation', async () => {
    const response = await createHero();

    expect(response.status).toBe(201);
    expect(Object.keys(response.body).sort()).toEqual(
      [
        'id',
        'name',
        'nickname',
        'date_of_birth',
        'universe',
        'main_power',
        'avatar_url',
        'is_active',
        'created_at',
        'updated_at',
      ].sort(),
    );
    expect(response.body.is_active).toBe(true);
    expect(response.body.name).toBe(validCreateBody.name);
  });

  it('GET /heroes returns heroes ordered by created_at descending', async () => {
    await createHero({ name: 'First', nickname: 'First-Nick' });
    await new Promise((resolve) => setTimeout(resolve, 20));
    await createHero({ name: 'Second', nickname: 'Second-Nick' });
    await new Promise((resolve) => setTimeout(resolve, 20));
    await createHero({ name: 'Third', nickname: 'Third-Nick' });

    const response = await request(app.getHttpServer()).get('/heroes');

    expect(response.status).toBe(200);
    const names = response.body.data.map((hero: { name: string }) => hero.name);
    expect(names).toEqual(['Third', 'Second', 'First']);
  });

  it('GET /heroes?search= filters case-insensitively by name or nickname', async () => {
    await createHero({ name: 'Peter Parker', nickname: 'Spider-Man' });
    await createHero({ name: 'Bruce Wayne', nickname: 'Batman' });

    const response = await request(app.getHttpServer())
      .get('/heroes')
      .query({ search: 'spider' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].nickname).toBe('Spider-Man');
  });

  it('GET /heroes returns exactly 10 items per page with correct pagination metadata', async () => {
    for (let i = 0; i < 12; i += 1) {
      await createHero({ name: `Hero ${i}`, nickname: `Nick ${i}` });
    }

    const page1 = await request(app.getHttpServer())
      .get('/heroes')
      .query({ page: 1 });
    const page2 = await request(app.getHttpServer())
      .get('/heroes')
      .query({ page: 2 });

    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 12,
      totalPages: 2,
    });
    expect(page2.body.data).toHaveLength(2);
  });

  it('PATCH /heroes/:id updates an active hero successfully', async () => {
    const created = await createHero();

    const response = await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}`)
      .send({ main_power: 'Updated power' });

    expect(response.status).toBe(200);
    expect(response.body.main_power).toBe('Updated power');
    expect(response.body.name).toBe(validCreateBody.name);
  });

  it('PATCH /heroes/:id returns 409 for an inactive hero', async () => {
    const created = await createHero();
    await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}/status`)
      .send({ is_active: false });

    const response = await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}`)
      .send({ main_power: 'Should not apply' });

    expect(response.status).toBe(409);
  });

  it('PATCH /heroes/:id/status toggles is_active and leaves other fields unchanged', async () => {
    const created = await createHero();

    const response = await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}/status`)
      .send({ is_active: false });

    expect(response.status).toBe(200);
    expect(response.body.is_active).toBe(false);
    expect(response.body.name).toBe(validCreateBody.name);
    expect(response.body.nickname).toBe(validCreateBody.nickname);
  });

  it('DELETE /heroes/:id removes an active hero; a subsequent GET returns 404', async () => {
    const created = await createHero();

    const deleteResponse = await request(app.getHttpServer()).delete(
      `/heroes/${created.body.id}`,
    );
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app.getHttpServer()).get(
      `/heroes/${created.body.id}`,
    );
    expect(getResponse.status).toBe(404);
  });

  it('DELETE /heroes/:id returns 409 for an inactive hero', async () => {
    const created = await createHero();
    await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}/status`)
      .send({ is_active: false });

    const response = await request(app.getHttpServer()).delete(
      `/heroes/${created.body.id}`,
    );

    expect(response.status).toBe(409);
  });

  it('POST /heroes and PATCH /heroes/:id return 400 with structured validation messages for invalid input', async () => {
    const missingFieldsResponse = await request(app.getHttpServer())
      .post('/heroes')
      .send({ name: 'Incomplete Hero' });
    expect(missingFieldsResponse.status).toBe(400);
    expect(Array.isArray(missingFieldsResponse.body.message)).toBe(true);

    const badAvatarResponse = await createHero({
      avatar_url: 'https://example.com/bad-image.txt',
    });
    expect(badAvatarResponse.status).toBe(400);

    const created = await createHero();
    const badAvatarUpdate = await request(app.getHttpServer())
      .patch(`/heroes/${created.body.id}`)
      .send({ avatar_url: 'https://example.com/bad-image.txt' });
    expect(badAvatarUpdate.status).toBe(400);
  });
});
