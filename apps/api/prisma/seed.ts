import { PrismaClient } from '@prisma/client';
import heroes from './seed-data/heroes.json';

const DEFAULT_COUNT = 50;

const prisma = new PrismaClient();

function parseCount(): number {
  const arg = process.argv.find((value) => value.startsWith('--count='));
  if (!arg) {
    return DEFAULT_COUNT;
  }
  const parsed = Number(arg.split('=')[1]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_COUNT;
}

async function main(): Promise<void> {
  const count = parseCount();

  if (count > heroes.length) {
    console.warn(
      `Requested ${count} heroes, but the cached dataset only has ${heroes.length}. Cycling through the dataset to reach ${count}.`,
    );
  }

  const data = Array.from({ length: count }, (_, i) => {
    const hero = heroes[i % heroes.length];
    return { ...hero, date_of_birth: new Date(hero.date_of_birth) };
  });
  await prisma.hero.createMany({ data });
  console.log(`Seeded ${count} heroes.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
