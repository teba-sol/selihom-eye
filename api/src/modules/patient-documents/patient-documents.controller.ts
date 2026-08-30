import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientDocumentsService } from './patient-documents.service';
import { CreatePatientDocumentDto } from './dto/patient-document.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientDocumentsController {
  constructor(private readonly patientDocumentsService: PatientDocumentsService) {}

  @Get(':patientId/documents')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async list(@Param('patientId') patientId: string) {
    return this.patientDocumentsService.list(patientId);
  }

  @Post(':patientId/documents')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async create(
    @Param('patientId') patientId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePatientDocumentDto,
  ) {
    return this.patientDocumentsService.create(patientId, user.userId, dto);
  }

  @Delete(':patientId/documents/:id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async delete(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.patientDocumentsService.delete(patientId, id);
  }
}