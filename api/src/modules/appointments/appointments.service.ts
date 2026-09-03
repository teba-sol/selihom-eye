import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, gte, lte } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { appointments, patients } from '../../database/schema';
import { BookAppointmentDto, UpdateAppointmentStatusDto, UpdateConsentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async book(dto: BookAppointmentDto) {
    const [newAppointment] = await this.db
      .insert(appointments)
      .values({
        patientId: dto.patientId,
        scheduledDate: new Date(dto.scheduledDate),
        startTime: dto.startTime || null,
        reason: dto.reason || null,
        status: dto.consentObtained ? 'CHECKED_IN' : 'SCHEDULED',
        consentObtained: dto.consentObtained ?? false,
        consentTimestamp: dto.consentObtained ? new Date() : null,
      })
      .returning();

    return newAppointment;
  }

  async findByRange(from?: string, to?: string, doctorId?: string) {
    const conditions: any[] = [];

    if (from) {
      conditions.push(gte(appointments.scheduledDate, new Date(from)));
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(appointments.scheduledDate, toDate));
    }
    if (doctorId) {
      conditions.push(eq(appointments.doctorUserId, doctorId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorUserId: appointments.doctorUserId,
        scheduledDate: appointments.scheduledDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        reason: appointments.reason,
        status: appointments.status,
        consentObtained: appointments.consentObtained,
        patient: {
          id: patients.id,
          mrn: patients.mrn,
          firstName: patients.firstName,
          lastName: patients.lastName,
          dob: patients.dob,
          gender: patients.gender,
          phone: patients.phone,
        },
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(where)
      .orderBy(appointments.scheduledDate);
  }

  async findByPatient(patientId: string) {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(appointments.scheduledDate);
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const [updated] = await this.db
      .update(appointments)
      .set({ status: dto.status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return updated;
  }

  async recordConsent(id: string, dto: UpdateConsentDto) {
    const [updated] = await this.db
      .update(appointments)
      .set({
        consentObtained: dto.consentObtained,
        consentTimestamp: dto.consentObtained ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return updated;
  }

  async cancel(id: string) {
    const [updated] = await this.db
      .update(appointments)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return updated;
  }
}
