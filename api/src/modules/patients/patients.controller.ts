import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
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

  @Get(':id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Patch(':id')
  @Roles('RECEPTIONIST', 'DOCTOR')
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }
}
