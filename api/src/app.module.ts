import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientDocumentsModule } from './modules/patient-documents/patient-documents.module';
import { OpticalOrdersModule } from './modules/optical-orders/optical-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    ClinicalModule,
    DoctorsModule,
    PatientDocumentsModule,
    OpticalOrdersModule,
  ],
})
export class AppModule {}
