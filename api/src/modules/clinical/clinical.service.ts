import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, inArray } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import {
  clinicalEncounters, refractionRecords, ocularCanvases,
  appointments, patients, users,
} from '../../database/schema';
import { UpsertClinicalEncounterDto, AddendumDto } from './dto/clinical.dto';

function numStr(v: unknown): string | null {
  return v === undefined || v === null || v === '' ? null : String(v);
}

@Injectable()
export class ClinicalService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  private async hydrate(encounterId: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, encounterId))
      .limit(1);

    if (!encounter) return null;

    const refractions = await this.db
      .select()
      .from(refractionRecords)
      .where(eq(refractionRecords.encounterId, encounter.id));

    const [canvas] = await this.db
      .select()
      .from(ocularCanvases)
      .where(eq(ocularCanvases.encounterId, encounter.id))
      .limit(1);

    const [patient] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.id, encounter.patientId))
      .limit(1);

    return {
      ...encounter,
      refractions,
      canvas: canvas || null,
      patient: patient
        ? {
            id: patient.id,
            mrn: patient.mrn,
            firstName: patient.firstName,
            lastName: patient.lastName,
            grandfatherName: patient.grandfatherName,
            gender: patient.gender,
            dob: patient.dob,
          }
        : null,
    };
  }

  async getEncounterByAppointmentId(appointmentId: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.appointmentId, appointmentId))
      .limit(1);

    if (!encounter) return null;
    return this.hydrate(encounter.id);
  }

  async getEncounterById(encounterId: string) {
    return this.hydrate(encounterId);
  }

  async upsertEncounter(doctorUserId: string, dto: UpsertClinicalEncounterDto) {
    // Eager-create: a walk-in exam may be created with only a patientId.
    // The encounter is created immediately so the client always has an id.
    const appointmentId = dto.appointmentId ?? null;
    let existing: any = null;

    if (dto.encounterId) {
      const [byId] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.id, dto.encounterId))
        .limit(1);
      existing = byId ?? null;
    } else if (appointmentId) {
      const [byApt] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.appointmentId, appointmentId))
        .limit(1);
      existing = byApt ?? null;
    }

    if (existing && existing.isLocked) {
      throw new BadRequestException('Encounter is locked and finalized. Use addendum to record further clinical updates.');
    }

    // When an appointment is provided, verify it exists and enforce a 1:1 map.
    if (appointmentId && !existing) {
      const [appointment] = await this.db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
      }
    }

    let tonometryPayload: any = undefined;
    if (dto.tonometry) {
      tonometryPayload = {
        ...dto.tonometry,
        isHighIopOd: (dto.tonometry.odIop ?? 0) > 21,
        isHighIopOs: (dto.tonometry.osIop ?? 0) > 21,
      };
    }

    let encounterId = existing?.id;

    if (existing) {
      const [updated] = await this.db
        .update(clinicalEncounters)
        .set({
          doctorUserId,
          // History & Symptoms
          reasonForVisit: dto.reasonForVisit ?? existing.reasonForVisit,
          chiefComplaints: dto.chiefComplaints ?? existing.chiefComplaints,
          symptomaticHistory: dto.symptomaticHistory ?? existing.symptomaticHistory,
          ocularHistory: dto.ocularHistory ?? existing.ocularHistory,
          systemicHistory: dto.systemicHistory ?? existing.systemicHistory,
          medicationHistory: dto.medicationHistory ?? existing.medicationHistory,
          medicationsAndCompliance: dto.medicationsAndCompliance ?? existing.medicationsAndCompliance,
          familyOcularHistory: dto.familyOcularHistory ?? existing.familyOcularHistory,
          familySystemicHistory: dto.familySystemicHistory ?? existing.familySystemicHistory,
          spectaclesHistory: dto.spectaclesHistory ?? existing.spectaclesHistory,
          contactLensHistory: dto.contactLensHistory ?? existing.contactLensHistory,
          lifestyleDemands: dto.lifestyleDemands ?? existing.lifestyleDemands,
          lifestyleAndDemands: dto.lifestyleAndDemands ?? existing.lifestyleAndDemands,
          // Vision
          visualAcuity: dto.visualAcuity ?? existing.visualAcuity,
          // Binocular
          binocularVision: dto.binocularVision ?? existing.binocularVision,
          pupilReflexes: dto.pupilReflexes ?? existing.pupilReflexes,
          // Segments
          slitLampFindings: dto.slitLampFindings ?? existing.slitLampFindings,
          posteriorSegment: dto.posteriorSegment ?? existing.posteriorSegment,
          // Tests
          tonometry: tonometryPayload ?? existing.tonometry,
          tearFilmWorkup: dto.tearFilmWorkup ?? existing.tearFilmWorkup,
          biometry: dto.biometry ?? existing.biometry,
          // Assessment
          diagnoses: dto.diagnoses ?? existing.diagnoses,
          treatmentPlanPathway: dto.treatmentPlanPathway ?? existing.treatmentPlanPathway,
          counselingAdviceGiven: dto.counselingAdviceGiven ?? existing.counselingAdviceGiven,
          sectionData: dto.sectionData ?? existing.sectionData,
          updatedAt: new Date(),
        })
        .where(eq(clinicalEncounters.id, existing.id))
        .returning();

      encounterId = updated.id;
    } else {
      const [inserted] = await this.db
        .insert(clinicalEncounters)
        .values({
          appointmentId: dto.appointmentId,
          patientId: dto.patientId,
          doctorUserId,
          reasonForVisit: dto.reasonForVisit || null,
          chiefComplaints: dto.chiefComplaints || null,
          symptomaticHistory: dto.symptomaticHistory || null,
          ocularHistory: dto.ocularHistory || null,
          systemicHistory: dto.systemicHistory || null,
          medicationHistory: dto.medicationHistory || null,
          medicationsAndCompliance: dto.medicationsAndCompliance || null,
          familyOcularHistory: dto.familyOcularHistory || null,
          familySystemicHistory: dto.familySystemicHistory || null,
          spectaclesHistory: dto.spectaclesHistory || null,
          contactLensHistory: dto.contactLensHistory || null,
          lifestyleDemands: dto.lifestyleDemands || null,
          lifestyleAndDemands: dto.lifestyleAndDemands || null,
          visualAcuity: dto.visualAcuity || null,
          binocularVision: dto.binocularVision || null,
          pupilReflexes: dto.pupilReflexes || null,
          slitLampFindings: dto.slitLampFindings || null,
          posteriorSegment: dto.posteriorSegment || null,
          tonometry: tonometryPayload || null,
          tearFilmWorkup: dto.tearFilmWorkup || null,
          biometry: dto.biometry || null,
          diagnoses: dto.diagnoses || null,
          treatmentPlanPathway: dto.treatmentPlanPathway || null,
          counselingAdviceGiven: dto.counselingAdviceGiven || null,
          sectionData: dto.sectionData || null,
        })
        .returning();

      encounterId = inserted.id;

      if (appointmentId) {
        await this.db
          .update(appointments)
          .set({ status: 'IN_EXAM', updatedAt: new Date() })
          .where(eq(appointments.id, appointmentId));
      }
    }

    // Upsert Refraction Records
    if (dto.refractions && dto.refractions.length > 0) {
      await this.db.delete(refractionRecords).where(eq(refractionRecords.encounterId, encounterId));
      for (const rx of dto.refractions) {
        await this.db.insert(refractionRecords).values({
          encounterId,
          type: rx.type,
          odSph: numStr(rx.od.sph),
          odCyl: numStr(rx.od.cyl),
          odAxis: numStr(rx.od.axis),
          odVa: rx.od.va ?? null,
          odAdd: numStr(rx.od.add),
          osSph: numStr(rx.os.sph),
          osCyl: numStr(rx.os.cyl),
          osAxis: numStr(rx.os.axis),
          osVa: rx.os.va ?? null,
          osAdd: numStr(rx.os.add),
          pdBinocular: numStr(rx.pdBinocular),
          pdOd: numStr(rx.pdOd),
          pdOs: numStr(rx.pdOs),
          bvdMm: numStr(rx.bvdMm),
          pinholeVaOd: rx.pinholeVaOd ?? null,
          pinholeVaOs: rx.pinholeVaOs ?? null,
        });
      }
    }

    // Upsert Canvas
    if (dto.canvas) {
      const [existingCanvas] = await this.db
        .select()
        .from(ocularCanvases)
        .where(eq(ocularCanvases.encounterId, encounterId))
        .limit(1);

      if (existingCanvas) {
        await this.db
          .update(ocularCanvases)
          .set({
            segmentType: dto.canvas.segmentType || 'CORNEA_ANTERIOR',
            odVectorData: dto.canvas.odVectorData ?? existingCanvas.odVectorData,
            osVectorData: dto.canvas.osVectorData ?? existingCanvas.osVectorData,
            odImageSnapshotUrl: dto.canvas.odImageSnapshotUrl ?? existingCanvas.odImageSnapshotUrl,
            osImageSnapshotUrl: dto.canvas.osImageSnapshotUrl ?? existingCanvas.osImageSnapshotUrl,
          })
          .where(eq(ocularCanvases.id, existingCanvas.id));
      } else {
        await this.db.insert(ocularCanvases).values({
          encounterId,
          segmentType: dto.canvas.segmentType || 'CORNEA_ANTERIOR',
          odVectorData: dto.canvas.odVectorData || null,
          osVectorData: dto.canvas.osVectorData || null,
          odImageSnapshotUrl: dto.canvas.odImageSnapshotUrl || null,
          osImageSnapshotUrl: dto.canvas.osImageSnapshotUrl || null,
        });
      }
    }

    return this.hydrate(encounterId);
  }

  async lockEncounter(id: string) {
    return this.db.transaction(async (tx) => {
      const [encounter] = await tx
        .select()
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.id, id))
        .limit(1);

      if (!encounter) {
        throw new NotFoundException(`Encounter with ID ${id} not found`);
      }

      const [locked] = await tx
        .update(clinicalEncounters)
        .set({ isLocked: true, lockedAt: new Date(), updatedAt: new Date() })
        .where(eq(clinicalEncounters.id, id))
        .returning();

      if (encounter.appointmentId) {
        await tx
          .update(appointments)
          .set({ status: 'COMPLETED', updatedAt: new Date() })
          .where(eq(appointments.id, encounter.appointmentId));
      }

      return locked;
    });
  }

  async deleteEncounter(id: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, id))
      .limit(1);

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    if (encounter.isLocked) {
      throw new BadRequestException('Finalized encounters cannot be deleted.');
    }

    await this.db.delete(refractionRecords).where(eq(refractionRecords.encounterId, id));
    await this.db.delete(ocularCanvases).where(eq(ocularCanvases.encounterId, id));
    await this.db.delete(clinicalEncounters).where(eq(clinicalEncounters.id, id));

    return { id };
  }

  async getCompletedCountsByPatient(patientIds: string[]) {
    if (!patientIds.length) return [];

    const rows = await this.db
      .select({
        patientId: clinicalEncounters.patientId,
        id: clinicalEncounters.id,
        isLocked: clinicalEncounters.isLocked,
      })
      .from(clinicalEncounters)
      .where(inArray(clinicalEncounters.patientId, patientIds));

    const counts = new Map<string, number>();
    for (const r of rows) {
      if (r.isLocked) {
        counts.set(r.patientId, (counts.get(r.patientId) ?? 0) + 1);
      }
    }
    return Array.from(counts, ([patientId, count]) => ({ patientId, count }));
  }

  async addAddendum(id: string, dto: AddendumDto, author?: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, id))
      .limit(1);

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    const timestamp = new Date().toISOString();
    const byLine = author ? ` by ${author}` : '';
    const entry = `[Addendum recorded${byLine} on ${timestamp}]:\n${dto.addendumNotes}`;
    const formattedAddendum = encounter.addendumNotes
      ? `${encounter.addendumNotes}\n\n${entry}`
      : entry;

    const [updated] = await this.db
      .update(clinicalEncounters)
      .set({ addendumNotes: formattedAddendum, updatedAt: new Date() })
      .where(eq(clinicalEncounters.id, id))
      .returning();

    return updated;
  }

  async getPatientHistory(patientId: string) {
    const rows = await this.db
      .select({
        id: clinicalEncounters.id,
        appointmentId: clinicalEncounters.appointmentId,
        createdAt: clinicalEncounters.createdAt,
        isLocked: clinicalEncounters.isLocked,
        diagnoses: clinicalEncounters.diagnoses,
        treatmentPlanPathway: clinicalEncounters.treatmentPlanPathway,
        tonometry: clinicalEncounters.tonometry,
        visualAcuity: clinicalEncounters.visualAcuity,
        addendumNotes: clinicalEncounters.addendumNotes,
        reasonForVisit: clinicalEncounters.reasonForVisit,
        appointmentDate: appointments.scheduledDate,
        appointmentReason: appointments.reason,
        appointmentStatus: appointments.status,
        doctor: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(clinicalEncounters)
      .innerJoin(users, eq(clinicalEncounters.doctorUserId, users.id))
      .leftJoin(appointments, eq(clinicalEncounters.appointmentId, appointments.id))
      .where(eq(clinicalEncounters.patientId, patientId))
      .orderBy(desc(clinicalEncounters.createdAt));

    return rows.map((r) => ({
      id: r.id,
      appointmentId: r.appointmentId,
      createdAt: r.createdAt,
      isLocked: r.isLocked,
      diagnoses: r.diagnoses,
      treatmentPlanPathway: r.treatmentPlanPathway,
      tonometry: r.tonometry,
      visualAcuity: r.visualAcuity,
      addendumNotes: r.addendumNotes,
      appointmentDate: r.appointmentDate ?? r.createdAt,
      appointmentReason:
        r.appointmentReason ??
        (typeof r.reasonForVisit === 'object' &&
        r.reasonForVisit !== null &&
        (r.reasonForVisit as any).selectedReason
          ? (r.reasonForVisit as any).selectedReason
          : null),
      appointmentStatus: r.appointmentStatus,
      doctor: r.doctor,
    }));
  }
}
