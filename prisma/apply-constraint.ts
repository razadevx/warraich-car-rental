import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Enabling btree_gist extension on Neon...');
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);
  console.log('btree_gist extension enabled.');

  console.log('Applying exclusion constraint to Booking table...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "no_overlapping_bookings";`);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Booking"
    ADD CONSTRAINT "no_overlapping_bookings"
    EXCLUDE USING gist (
      "carId" WITH =,
      tsrange("pickupDateTime", "returnDateTime") WITH &&
    )
    WHERE ("status" IN ('PENDING', 'CONFIRMED', 'ACTIVE'));
  `);
  console.log('PostgreSQL concurrency exclusion constraint successfully applied!');
}

run()
  .catch((err) => {
    console.error('Error applying constraint:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
