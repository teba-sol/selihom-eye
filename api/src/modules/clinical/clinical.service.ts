import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import {
  clinicalEncounters, refractionRecords, ocularCanvases,
  appointments, patients, users,
} from '../../database/schema';
import { UpsertClinicalEncounterDto, AddendumDto } from './dto/clinical.dto';

@Injectable()
export class ClinicalService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async getEncounterByAppointmentId(appointmentId: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.appointmentId, appointmentId))
      .limit(1);

    if (!encounter) {
      return null;
    }

    const refractions = await this.db
      .select()
      .from(refractionRecords)
      .where(eq(refractionRecords.encounterId, encounter.id));

    const [canvas] = await this.db
      .select()
      .from(ocularCanvases)
      .where(eq(ocularCanvases.encounterId, encounter.id))
      .limit(1);

    return {
      ...encounter,
      refractions,
      canvas: canvas || null,
    };
  }

  async upsertEncounter(doctorUserId: string, dto: UpsertClinicalEncounterDto) {
    const [appointment] = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, dto.appointmentId))
      .limit(1);

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${dto.appointmentId} not found`);
    }

    const [existing] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.appointmentId, dto.appointmentId))
      .limit(1);

    if (existing && existing.isLocked) {
      throw new BadRequestException('Encounter is locked and finalized. Use addendum to record further clinical updates.');
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
        })
        .returning();

      encounterId = inserted.id;

      await this.db
        .update(appointments)
        .set({ status: 'IN_EXAM', updatedAt: new Date() })
        .where(eq(appointments.id, dto.appointmentId));
    }

    // Upsert Refraction Records
    if (dto.refractions && dto.refractions.length > 0) {
      await this.db.delete(refractionRecords).where(eq(refractionRecords.encounterId, encounterId));
      for (const rx of dto.refractions) {
        await this.db.insert(refractionRecords).values({
          encounterId,
          type: rx.type,
          odSph: rx.od.sph !== undefined ? String(rx.od.sph) : null,
          odCyl: rx.od.cyl !== undefined ? String(rx.od.cyl) : null,
          odAxis: rx.od.axis ?? null,
          odVa: rx.od.va ?? null,
          odAdd: rx.od.add !== undefined ? String(rx.od.add) : null,
          osSph: rx.os.sph !== undefined ? String(rx.os.sph) : null,
          osCyl: rx.os.cyl !== undefined ? String(rx.os.cyl) : null,
          osAxis: rx.os.axis ?? null,
          osVa: rx.os.va ?? null,
          osAdd: rx.os.add !== undefined ? String(rx.os.add) : null,
          pdBinocular: rx.pdBinocular !== undefined ? String(rx.pdBinocular) : null,
          pdOd: rx.pdOd !== undefined ? String(rx.pdOd) : null,
          pdOs: rx.pdOs !== undefined ? String(rx.pdOs) : null,
          bvdMm: rx.bvdMm !== undefined ? String(rx.bvdMm) : null,
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

    return this.getEncounterByAppointmentId(dto.appointmentId);
  }

  async lockEncounter(id: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, id))
      .limit(1);

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    const [locked] = await this.db
      .update(clinicalEncounters)
      .set({ isLocked: true, lockedAt: new Date(), updatedAt: new Date() })
      .where(eq(clinicalEncounters.id, id))
      .returning();

    await this.db
      .update(appointments)
      .set({ status: 'COMPLETED', updatedAt: new Date() })
      .where(eq(appointments.id, encounter.appointmentId));

    return locked;
  }

  async addAddendum(id: string, dto: AddendumDto) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, id))
      .limit(1);

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    const timestamp = new Date().toISOString();
    const formattedAddendum = encounter.addendumNotes
      ? `${encounter.addendumNotes}\n\n[Addendum recorded on ${timestamp}]:\n${dto.addendumNotes}`
      : `[Addendum recorded on ${timestamp}]:\n${dto.addendumNotes}`;

    const [updated] = await this.db
      .update(clinicalEncounters)
      .set({ addendumNotes: formattedAddendum, updatedAt: new Date() })
      .where(eq(clinicalEncounters.id, id))
      .returning();

    return updated;
  }

  async getPatientHistory(patientId: string) {
    return this.db
      .select({
        id: clinicalEncounters.id,
        appointmentId: clinicalEncounters.appointmentId,
        createdAt: clinicalEncounters.createdAt,
        isLocked: clinicalEncounters.isLocked,
        diagnoses: clinicalEncounters.diagnoses,
        treatmentPlanPathway: clinicalEncounters.treatmentPlanPathway,
        tonometry: clinicalEncounters.tonometry,
        visualAcuity: clinicalEncounters.visualAcuity,
        doctor: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(clinicalEncounters)
      .innerJoin(users, eq(clinicalEncounters.doctorUserId, users.id))
      .where(eq(clinicalEncounters.patientId, patientId))
      .orderBy(desc(clinicalEncounters.createdAt));
  }
}
