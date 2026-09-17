import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('RECEPTIONIST', 'DOCTOR')
  async create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Get()
  @Roles('RECEPTIONIST', 'DOCTOR')
  async search(@Query('q') q: string) {
    return this.patientsService.search(q);
  }

  @Patch(':id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Get('export-records')
  @Roles('DOCTOR')
  async exportRecords() {
    return this.patientsService.exportFinalizedRecords();
  }

  /** Removes patient-owned records only. Staff accounts are intentionally retained. */
  @Delete('purge')
  @Roles('DOCTOR')
  async purge() {
    return this.patientsService.purgePatientRecords();
  }

  @Get(':id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }
}
