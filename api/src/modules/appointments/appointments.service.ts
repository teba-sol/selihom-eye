import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, gte, lte } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { appointments, patients } from '../../database/schema';
import { BookAppointmentDto, CancelAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async book(dto: BookAppointmentDto, doctorUserId: string) {
    // Validate not a past date/time — compare calendar dates in the server's
    // local timezone, NOT the booking-day midnight against "now", which would
    // wrongly reject any appointment booked for today.
    const now = new Date();
    const today = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    if (dto.scheduledDate < today) {
      throw new BadRequestException('Cannot book an appointment in the past.');
    }
    // Same-day bookings must also be after the current time.
    if (dto.scheduledDate === today && dto.startTime) {
      const nowParts: Record<string, string> = {};
      for (const part of new Intl.DateTimeFormat('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now)) {
        nowParts[part.type] = part.value;
      }
      const nowHHMM = `${nowParts.hour === '24' ? '00' : nowParts.hour}:${nowParts.minute}`;
      if (dto.startTime <= nowHHMM) {
        const nowMatch = nowHHMM.match(/^(\d{1,2}):(\d{2})/)!;
        const h = Number(nowMatch[1]) % 24;
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const period = h < 12 ? 'AM' : 'PM';
        throw new BadRequestException(
          `Cannot book an appointment in the past. Current time is ${String(h12).padStart(2, '0')}:${nowMatch[2]} ${period}. Adjust your time please!`,
        );
      }
    }

    // Validate patient exists
    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, dto.patientId))
      .limit(1);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${dto.patientId} not found.`);
    }

    const [newAppointment] = await this.db
      .insert(appointments)
      .values({
        patientId: dto.patientId,
        doctorUserId,
        scheduledDate: new Date(dto.scheduledDate),
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        reason: dto.reason,
        notes: dto.notes || null,
        estimatedDuration: dto.estimatedDuration || 30,
        status: 'SCHEDULED',
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
        notes: appointments.notes,
        estimatedDuration: appointments.estimatedDuration,
        sourceEncounterId: appointments.sourceEncounterId,
        cancelledBy: appointments.cancelledBy,
        cancelledAt: appointments.cancelledAt,
        cancellationReason: appointments.cancellationReason,
        createdAt: appointments.createdAt,
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

  async cancel(id: string, dto: CancelAppointmentDto, userId: string) {
    // Fetch current appointment
    const [existing] = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }

    if (existing.status !== 'SCHEDULED') {
      throw new BadRequestException('Only SCHEDULED appointments can be cancelled.');
    }

    const [updated] = await this.db
      .update(appointments)
      .set({
        status: 'CANCELLED',
        cancelledBy: userId,
        cancelledAt: new Date(),
        cancellationReason: dto.cancellationReason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    return updated;
  }
}
