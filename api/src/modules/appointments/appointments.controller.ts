import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto, CancelAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('DOCTOR')
  async book(@Body() dto: BookAppointmentDto, @CurrentUser() user: RequestUser) {
    return this.appointmentsService.book(dto, user.userId);
  }

  @Get()
  @Roles('RECEPTIONIST', 'DOCTOR')
  async findByRange(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.appointmentsService.findByRange(from, to, doctorId);
  }

  @Get('patient/:patientId')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Patch(':id/status')
  @Roles('DOCTOR')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  @Roles('DOCTOR')
  async cancel(@Param('id') id: string, @Body() dto: CancelAppointmentDto, @CurrentUser() user: RequestUser) {
    return this.appointmentsService.cancel(id, dto, user.userId);
  }
}
