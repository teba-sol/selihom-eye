import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL')!;
        const client = postgres(connectionString, {
          ssl: 'require',
          // This URL uses Supabase's transaction pooler, which does not retain
          // server-side prepared statements between transactions.
          prepare: false,
          max: 5,
          idle_timeout: 20,
          connect_timeout: 15,
          max_lifetime: 60 * 10,
          onnotice: () => undefined,
        });
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
