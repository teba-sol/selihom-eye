import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const client = postgres(connectionString, { ssl: 'require' });

  const sqlFile = fs.readFileSync(
    path.join(__dirname, '..', 'drizzle', '0002_add_appointment_fields.sql'),
    'utf-8',
  );

  const statements = sqlFile
    .split('--> statement-breakpoint')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  console.log(`Executing ${statements.length} migration statements...`);

  for (const stmt of statements) {
    console.log(`  > ${stmt.substring(0, 80)}...`);
    await client.unsafe(stmt);
    console.log('    OK');
  }

  await client.end();
  console.log('\nMigration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
