import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { users } from '../../database/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'selihome_clinical_jwt_secret_key_2026',
    });
  }

  async validate(payload: { sub: string; email: string; role: 'RECEPTIONIST' | 'DOCTOR' }) {
    const [user] = await this.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) {
      throw new UnauthorizedException('User account not found or deactivated');
    }
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
