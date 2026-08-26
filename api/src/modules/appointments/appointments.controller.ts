import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto, UpdateAppointmentStatusDto, UpdateConsentDto } from './dto/appointment.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('RECEPTIONIST', 'DOCTOR')
  async book(@Body() dto: BookAppointmentDto) {
    return this.appointmentsService.book(dto);
  }

  @Get('queue')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async getLiveQueue() {
    return this.appointmentsService.getLiveQueue();
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
  @Roles('RECEPTIONIST', 'DOCTOR')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @Patch(':id/consent')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async recordConsent(@Param('id') id: string, @Body() dto: UpdateConsentDto) {
    return this.appointmentsService.recordConsent(id, dto);
  }

  @Delete(':id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}
