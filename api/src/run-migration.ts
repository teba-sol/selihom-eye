import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

function resolveDrizzleDir(): string {
  let dir = __dirname;
  while (true) {
    const candidate = path.join(dir, 'drizzle');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('Could not locate the drizzle directory');
}

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const client = postgres(connectionString, { ssl: 'require' });

  // The migration file to run. Defaults to the latest migration. Override with
  // MIGRATION_FILE=0002_add_appointment_fields.sql if you need to run an older
  // migration against an environment where the table was created differently.
  const file = process.env.MIGRATION_FILE ?? '0008_add_user_refresh_token.sql';

  const filePath = path.join(resolveDrizzleDir(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`Migration file not found: ${filePath}`);
    process.exit(1);
  }

  const sqlFile = fs.readFileSync(filePath, 'utf-8');
  const statements = sqlFile
    .split('--> statement-breakpoint')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  console.log(`Running migration ${file} (${statements.length} statements)...`);

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
