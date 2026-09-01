import {
  Controller, Post, Get, Patch, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OpticalOrdersService } from './optical-orders.service';
import { UpsertOpticalOrderDto } from './dto/optical-order.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('optical-orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OpticalOrdersController {
  constructor(private readonly opticalOrdersService: OpticalOrdersService) {}

  @Post()
  @Roles('DOCTOR', 'RECEPTIONIST')
  async upsert(@CurrentUser() user: RequestUser, @Body() dto: UpsertOpticalOrderDto) {
    return this.opticalOrdersService.upsert(dto, user.userId);
  }

  @Get()
  @Roles('DOCTOR', 'RECEPTIONIST')
  async list(@Query('status') status?: string) {
    return this.opticalOrdersService.list(status);
  }

  @Get('encounter/:encounterId')
  @Roles('DOCTOR', 'RECEPTIONIST')
  async findByEncounter(@Param('encounterId') encounterId: string) {
    return this.opticalOrdersService.findByEncounter(encounterId);
  }

  @Get(':id')
  @Roles('DOCTOR', 'RECEPTIONIST')
  async findById(@Param('id') id: string) {
    return this.opticalOrdersService.findById(id);
  }

  @Patch(':id/deliver')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async deliver(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.opticalOrdersService.deliver(id, user.userId);
  }
}
