import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('doctors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Roles('RECEPTIONIST', 'DOCTOR')
  async findAll() {
    return this.doctorsService.findAll();
  }
}
