import { Controller, Post, Body, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterStaffDto, UpdateProfileDto } from './dto/auth.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterStaffDto) {
    return this.authService.registerStaff(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.userId, dto);
  }
}
