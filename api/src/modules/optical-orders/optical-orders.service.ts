import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { opticalPrescriptions, patients } from '../../database/schema';
import { UpsertOpticalOrderDto } from './dto/optical-order.dto';

function numStr(v: unknown): string | null {
  return v === undefined || v === null || v === '' ? null : String(v);
}

@Injectable()
export class OpticalOrdersService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  private async markSent(order: any) {
    const { odSph, odCyl, odAxis, odAdd, osSph, osCyl, osAxis, osAdd, ...rest } = order;
    return {
      ...rest,
      rx: {
        od: { sph: odSph, cyl: odCyl, axis: odAxis, add: odAdd },
        os: { sph: osSph, cyl: osCyl, axis: osAxis, add: osAdd },
      },
    };
  }

  private baseSelect() {
    return this.db
      .select({
        id: opticalPrescriptions.id,
        encounterId: opticalPrescriptions.encounterId,
        appointmentId: opticalPrescriptions.appointmentId,
        patientId: opticalPrescriptions.patientId,
        prescribedByDoctorId: opticalPrescriptions.prescribedByDoctorId,
        odSph: opticalPrescriptions.odSph,
        odCyl: opticalPrescriptions.odCyl,
        odAxis: opticalPrescriptions.odAxis,
        odAdd: opticalPrescriptions.odAdd,
        osSph: opticalPrescriptions.osSph,
        osCyl: opticalPrescriptions.osCyl,
        osAxis: opticalPrescriptions.osAxis,
        osAdd: opticalPrescriptions.osAdd,
        lensType: opticalPrescriptions.lensType,
        lensMaterial: opticalPrescriptions.lensMaterial,
        coatings: opticalPrescriptions.coatings,
        frameType: opticalPrescriptions.frameType,
        frameRef: opticalPrescriptions.frameRef,
        collectionMethod: opticalPrescriptions.collectionMethod,
        orderRef: opticalPrescriptions.orderRef,
        status: opticalPrescriptions.status,
        pdMm: opticalPrescriptions.pdMm,
        notes: opticalPrescriptions.notes,
        pdfUrl: opticalPrescriptions.pdfUrl,
        deliveredAt: opticalPrescriptions.deliveredAt,
        deliveredByUserId: opticalPrescriptions.deliveredByUserId,
        createdAt: opticalPrescriptions.createdAt,
        updatedAt: opticalPrescriptions.updatedAt,
        patient: {
          id: patients.id,
          mrn: patients.mrn,
          firstName: patients.firstName,
          lastName: patients.lastName,
          grandfatherName: patients.grandfatherName,
          phone: patients.phone,
          gender: patients.gender,
          dob: patients.dob,
        },
      })
      .from(opticalPrescriptions)
      .innerJoin(patients, eq(opticalPrescriptions.patientId, patients.id));
  }

  async upsert(dto: UpsertOpticalOrderDto, doctorId: string) {
    if (!dto.encounterId) {
      throw new BadRequestException('encounterId is required');
    }

    const values = {
      appointmentId: dto.appointmentId || null,
      encounterId: dto.encounterId,
      patientId: dto.patientId,
      prescribedByDoctorId: doctorId,
      odSph: numStr(dto.rx?.od?.sph),
      odCyl: numStr(dto.rx?.od?.cyl),
      odAxis: numStr(dto.rx?.od?.axis),
      odAdd: numStr(dto.rx?.od?.add),
      osSph: numStr(dto.rx?.os?.sph),
      osCyl: numStr(dto.rx?.os?.cyl),
      osAxis: numStr(dto.rx?.os?.axis),
      osAdd: numStr(dto.rx?.os?.add),
      lensType: dto.lensType || null,
      lensMaterial: dto.lensMaterial || null,
      coatings: dto.coatings && dto.coatings.length ? dto.coatings : null,
      frameType: dto.frameType || null,
      frameRef: dto.frameRef || null,
      collectionMethod: dto.collectionMethod || null,
      orderRef: dto.orderRef || null,
      pdMm: numStr(dto.pdMm),
      notes: dto.notes || null,
      status: 'READY_TO_DELIVER',
    };

    const [existing] = await this.db
      .select()
      .from(opticalPrescriptions)
      .where(eq(opticalPrescriptions.encounterId, dto.encounterId))
      .orderBy(desc(opticalPrescriptions.createdAt))
      .limit(1);

    // A delivered order is locked: preserve the snapshot, do not create a new
    // pending order for the same encounter.
    if (existing && existing.status === 'DELIVERED') {
      return this.markSent(existing);
    }

    let [saved] = existing
      ? await this.db
          .update(opticalPrescriptions)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(opticalPrescriptions.id, existing.id))
          .returning()
      : await this.db.insert(opticalPrescriptions).values(values).returning();

    if (!saved) {
      throw new BadRequestException('Could not save the optical order');
    }

    return this.markSent(saved);
  }

  async findByEncounter(encounterId: string) {
    const rows = await this.db
      .select()
      .from(opticalPrescriptions)
      .where(eq(opticalPrescriptions.encounterId, encounterId))
      .orderBy(desc(opticalPrescriptions.createdAt))
      .limit(1);

    if (!rows.length) return null;
    return this.markSent(rows[0]);
  }

  async findById(id: string) {
    const [row] = await this.baseSelect().where(eq(opticalPrescriptions.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Optical order ${id} not found`);
    return this.markSent(row);
  }

  async list(status?: string) {
    const conditions: any[] = [];
    if (status && ['READY_TO_DELIVER', 'DELIVERED'].includes(status)) {
      conditions.push(eq(opticalPrescriptions.status, status));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await this.baseSelect().where(where).orderBy(desc(opticalPrescriptions.createdAt));
    return Promise.all(rows.map((r: any) => this.markSent(r)));
  }

  async deliver(id: string, userId: string) {
    const [existing] = await this.db
      .select()
      .from(opticalPrescriptions)
      .where(eq(opticalPrescriptions.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Optical order ${id} not found`);
    }
    if (existing.status === 'DELIVERED') {
      return this.markSent(existing);
    }

    const [updated] = await this.db
      .update(opticalPrescriptions)
      .set({
        status: 'DELIVERED',
        deliveredAt: new Date(),
        deliveredByUserId: userId,
        updatedAt: new Date(),
      })
      .where(eq(opticalPrescriptions.id, id))
      .returning();

    return this.markSent(updated);
  }
}
