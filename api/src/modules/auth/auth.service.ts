import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { users } from '../../database/schema';
import { LoginDto, RegisterStaffDto, RefreshDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: any,
    private jwtService: JwtService,
  ) {}

  private generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildUserPayload(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  private async issueTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    await this.db
      .update(users)
      .set({ refreshToken: this.hashToken(refreshToken) })
      .where(eq(users.id, user.id));
    return { accessToken, refreshToken };
  }

  async registerStaff(dto: RegisterStaffDto) {
    const [existing] = await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [newUser] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        licenseNumber: dto.licenseNumber || null,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      });

    return newUser;
  }

  async login(dto: LoginDto) {
    const [user] = await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.buildUserPayload(user),
    };
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const [user] = await this.db.select().from(users).where(eq(users.refreshToken, tokenHash)).limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.buildUserPayload(user),
    };
  }
}
