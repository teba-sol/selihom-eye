import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { users } from '../../database/schema';
import { LoginDto, RegisterStaffDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: any,
    private jwtService: JwtService,
  ) {}

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

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
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
