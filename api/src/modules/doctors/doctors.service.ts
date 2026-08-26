import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { users } from '../../database/schema';

@Injectable()
export class DoctorsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async findAll() {
    return this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        licenseNumber: users.licenseNumber,
      })
      .from(users)
      .where(eq(users.role, 'DOCTOR'));
  }
}
