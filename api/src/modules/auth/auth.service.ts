import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { users, sessions } from '../../database/schema';
import { LoginDto, RegisterStaffDto, UpdateProfileDto } from './dto/auth.dto';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_COOKIE = 'refresh_token';

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

  private readRefreshCookie(req: Request): string | null {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${REFRESH_COOKIE}=`));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
  }

  private setRefreshCookie(res: Response, token: string) {
    const secure = process.env.COOKIE_SECURE === 'true';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TTL_MS,
    });
  }

  private clearRefreshCookie(res: Response) {
    const secure = process.env.COOKIE_SECURE === 'true';
    res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure, sameSite: 'lax', path: '/' });
  }

  private getClientInfo(req: Request) {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
      deviceName: req.headers['x-device-name'] as string | null ?? null,
    };
  }

  private async createSession(userId: string, req: Request, res: Response): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.generateRefreshToken();
    const client = this.getClientInfo(req);

    await this.db.insert(sessions).values({
      userId,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      userAgent: client.userAgent,
      ip: client.ip,
      deviceName: client.deviceName,
    });

    this.setRefreshCookie(res, refreshToken);
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, refreshToken };
  }

  private async rotateSession(oldTokenHash: string, userId: string, req: Request, res: Response) {
    await this.db.update(sessions).set({ revoked: true }).where(eq(sessions.refreshTokenHash, oldTokenHash));
    return this.createSession(userId, req, res);
  }

  private async getValidSession(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.refreshTokenHash, tokenHash),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, new Date()),
      ))
      .limit(1);
    return session ?? null;
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

  async login(dto: LoginDto, req: Request, res: Response) {
    const [user] = await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken } = await this.createSession(user.id, req, res);

    return {
      accessToken,
      user: this.buildUserPayload(user),
    };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = this.readRefreshCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const session = await this.getValidSession(refreshToken);
    if (!session) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('Invalid or expired session');
    }

    const { accessToken } = await this.rotateSession(session.refreshTokenHash, session.userId, req, res);

    const [user] = await this.db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('User not found');
    }

    return {
      accessToken,
      user: this.buildUserPayload(user),
    };
  }

  async logout(req: Request, res: Response) {
    const refreshToken = this.readRefreshCookie(req);
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.db.update(sessions).set({ revoked: true }).where(eq(sessions.refreshTokenHash, tokenHash));
    }
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  async revokeAll(userId: string) {
    await this.db.update(sessions).set({ revoked: true }).where(eq(sessions.userId, userId));
    return { ok: true };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new UnauthorizedException('User not found');

    const updates: Record<string, any> = { updatedAt: new Date() };

    if (dto.firstName && dto.firstName.trim()) {
      updates.firstName = dto.firstName.trim();
    }

    if (dto.lastName && dto.lastName.trim()) {
      updates.lastName = dto.lastName.trim();
    }

    if (dto.email && dto.email !== user.email) {
      const [conflict] = await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1);
      if (conflict) throw new ConflictException('Email already in use');
      updates.email = dto.email;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');
      updates.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role });

    return updated;
  }
}
