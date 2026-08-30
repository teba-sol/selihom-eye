import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { users } from './database/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }

  const client = postgres(connectionString, { ssl: 'require' });
  const db = drizzle(client);

  const seedUsers = [
    {
      email: 'doctor@selihome.com',
      password: 'password123',
      firstName: 'Dr.',
      lastName: 'Tarekegn',
      role: 'DOCTOR' as const,
      licenseNumber: 'OPT-2024-001',
    },
    {
      email: 'receptionist@selihome.com',
      password: 'password123',
      firstName: 'Amina',
      lastName: 'Hassan',
      role: 'RECEPTIONIST' as const,
      licenseNumber: null,
    },
  ];

  for (const u of seedUsers) {
    const [existing] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    if (existing) {
      console.log(`  User ${u.email} already exists, skipping`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    const [created] = await db
      .insert(users)
      .values({
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        licenseNumber: u.licenseNumber,
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    console.log(`  Created ${created.role}: ${created.email} (${created.id})`);
  }

  await client.end();
  console.log('\nSeed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
