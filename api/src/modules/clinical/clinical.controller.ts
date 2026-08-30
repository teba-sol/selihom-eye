import {
  Controller, Post, Get, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClinicalService } from './clinical.service';
import { UpsertClinicalEncounterDto, AddendumDto } from './dto/clinical.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('clinical')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('encounter')
  @Roles('DOCTOR')
  async upsertEncounter(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpsertClinicalEncounterDto,
  ) {
    return this.clinicalService.upsertEncounter(user.userId, dto);
  }

  @Get('appointment/:appointmentId')
  @Roles('DOCTOR', 'RECEPTIONIST')
  async getByAppointmentId(@Param('appointmentId') appointmentId: string) {
    return this.clinicalService.getEncounterByAppointmentId(appointmentId);
  }

  @Patch('encounter/:id/lock')
  @Roles('DOCTOR')
  async lockEncounter(@Param('id') id: string) {
    return this.clinicalService.lockEncounter(id);
  }

  @Post('encounter/:id/addendum')
  @Roles('DOCTOR')
  async addAddendum(
    @Param('id') id: string,
    @Body() dto: AddendumDto,
    @CurrentUser() user: RequestUser,
  ) {
    const author = dto.author || (user ? `${user.firstName} ${user.lastName}`.trim() : undefined);
    return this.clinicalService.addAddendum(id, dto, author);
  }

  @Get('patient/:patientId/history')
  @Roles('DOCTOR', 'RECEPTIONIST')
  async getPatientHistory(@Param('patientId') patientId: string) {
    return this.clinicalService.getPatientHistory(patientId);
  }
}
