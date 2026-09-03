import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc, inArray, count, sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import {
  clinicalEncounters, refractionRecords, ocularCanvases,
  appointments, patients, users, surgicalProcedures,
} from '../../database/schema';
import { UpsertClinicalEncounterDto, AddendumDto } from './dto/clinical.dto';

function numStr(v: unknown): string | null {
  return v === undefined || v === null || v === '' ? null : String(v);
}

const SURGERY_STATUSES = new Set(['PLANNED', 'COMPLETED', 'CANCELLED', 'RE-SCHEDULED']);

@Injectable()
export class ClinicalService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  /**
   * Project the encounter's surgery list (from sectionData['action-and-advice'],
   * with a legacy flat-field fallback) into the normalized surgical_procedures
   * table. Runs inside the caller's transaction so a failure rolls everything back.
   */
  private async syncSurgeries(tx: any, encounterId: string, doctorUserId: string, patientId: string, appointmentId: string | null, dto: UpsertClinicalEncounterDto) {
    const aa: any = dto.sectionData?.['action-and-advice'] ?? {};
    let list: any[] = [];

    if (Array.isArray(aa.surgeries) && aa.surgeries.length > 0) {
      list = aa.surgeries;
    } else if (aa.surgeryType) {
      list = [
        {
          type: aa.surgeryType,
          otherName: aa.surgeryOther ?? '',
          remarks: aa.surgeryRemarks ?? '',
          cataractDetails: aa.cataractDetails,
          genericDetails:
            aa.surgeryType === 'Other (Enter Manually)'
              ? aa.genericSurgeryDetails?.['Other (Enter Manually)']
              : aa.genericSurgeryDetails?.[aa.surgeryType],
        },
      ];
    }

    await tx.delete(surgicalProcedures).where(eq(surgicalProcedures.encounterId, encounterId));

    if (list.length === 0) return;

    const rows = list.map((s: any, i: number) => {
      const type = String(s?.type ?? '').trim();
      const cataract = s?.cataractDetails;
      const generic = s?.genericDetails;
      const eye = cataract?.eyeToBeOperated ?? generic?.eyeToBeOperated ?? '';
      const dateOfSurgery = cataract?.dateOfSurgery ?? generic?.dateOfSurgery ?? '';
      const surgeon = cataract?.surgeon ?? generic?.surgeon ?? '';
      const status = SURGERY_STATUSES.has(String(s?.status ?? '').trim().toUpperCase())
        ? String(s.status).trim().toUpperCase()
        : 'PLANNED';
      return {
        encounterId,
        patientId,
        doctorUserId,
        appointmentId,
        index: i,
        type,
        otherName: String(s?.otherName ?? '').trim() || null,
        eye: eye || null,
        dateOfSurgery: dateOfSurgery || null,
        surgeon: surgeon || null,
        status,
        remarks: s?.remarks ? String(s.remarks) : null,
        showInDischarge: s?.showInDischarge === true,
        details: {
          type,
          otherName: s?.otherName ?? '',
          status,
          plannedOn: s?.plannedOn ?? '',
          completedOn: s?.completedOn ?? '',
          outcome: s?.outcome ?? '',
          cataractDetails: cataract ?? null,
          genericDetails: generic ?? null,
        },
      };
    });

    await tx.insert(surgicalProcedures).values(rows);
  }

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

    // Walk-in safety net: if neither encounterId nor appointmentId was supplied,
    // reuse the most recent unlocked encounter for this patient to prevent
    // duplicate active exams (e.g. two browser tabs racing to create one).
    if (!existing && !dto.encounterId && !appointmentId) {
      const [active] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(and(
          eq(clinicalEncounters.patientId, dto.patientId),
          eq(clinicalEncounters.isLocked, false),
        ))
        .orderBy(desc(clinicalEncounters.createdAt))
        .limit(1);
      if (active) existing = active;
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

    // All write operations (encounter + refractions + canvas) run inside a
    // single transaction so a failure at any step rolls the whole upsert
    // back — no partial/ inconsistent clinical state.
    const encounterId = await this.db.transaction(async (tx) => {
      let id = existing?.id;

      if (existing) {
        const [updated] = await tx
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

        id = updated.id;
      } else {
        const [inserted] = await tx
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

        id = inserted.id;

        if (appointmentId) {
          await tx
            .update(appointments)
            .set({ status: 'IN_EXAM', updatedAt: new Date() })
            .where(eq(appointments.id, appointmentId));
        }
      }

      // Upsert Refraction Records (single delete + single batched insert,
      // atomic within the transaction). Delete-then-insert is correct here:
      // refraction_records has no unique key on (encounter_id, type).
      if (dto.refractions && dto.refractions.length > 0) {
        await tx.delete(refractionRecords).where(eq(refractionRecords.encounterId, id));
        await tx.insert(refractionRecords).values(
          dto.refractions.map((rx) => ({
            encounterId: id,
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
          })),
        );
      }

      // Upsert Canvas
      if (dto.canvas) {
        const [existingCanvas] = await tx
          .select()
          .from(ocularCanvases)
          .where(eq(ocularCanvases.encounterId, id))
          .limit(1);

        if (existingCanvas) {
          await tx
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
          await tx.insert(ocularCanvases).values({
            encounterId: id,
            segmentType: dto.canvas.segmentType || 'CORNEA_ANTERIOR',
            odVectorData: dto.canvas.odVectorData || null,
            osVectorData: dto.canvas.osVectorData || null,
            odImageSnapshotUrl: dto.canvas.odImageSnapshotUrl || null,
            osImageSnapshotUrl: dto.canvas.osImageSnapshotUrl || null,
          });
        }
      }

      // Project the encounter's surgery list into surgical_procedures.
      await this.syncSurgeries(tx, id, doctorUserId, dto.patientId, appointmentId, dto);

      return id;
    });

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

    // Defensive cap so a very long query can't balloon into a huge read.
    const ids = patientIds.slice(0, 200);

    const rows = await this.db
      .select({
        patientId: clinicalEncounters.patientId,
        count: count(clinicalEncounters.id),
      })
      .from(clinicalEncounters)
      .where(and(
        inArray(clinicalEncounters.patientId, ids),
        eq(clinicalEncounters.isLocked, true),
      ))
      .groupBy(clinicalEncounters.patientId);

    return rows.map((r) => ({ patientId: r.patientId, count: r.count }));
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
        updatedAt: clinicalEncounters.updatedAt,
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
      updatedAt: r.updatedAt,
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

  /**
   * List all recorded surgeries (normalized projection), joined with the
   * patient, doctor and encounter date for the doctor-side Surgeries page.
   */
  async getSurgeries(filters: { status?: string; patientId?: string; from?: string; to?: string } = {}) {
    const conds: any[] = [];

    if (filters.status) {
      conds.push(eq(surgicalProcedures.status, filters.status as any));
    }
    if (filters.patientId) {
      conds.push(eq(surgicalProcedures.patientId, filters.patientId));
    }
    if (filters.from) {
      conds.push(sql`${surgicalProcedures.createdAt} >= ${new Date(filters.from)}::timestamptz`);
    }
    if (filters.to) {
      conds.push(sql`${surgicalProcedures.createdAt} <= ${new Date(filters.to)}::timestamptz`);
    }

    const rows = await this.db
      .select({
        id: surgicalProcedures.id,
        encounterId: surgicalProcedures.encounterId,
        patientId: surgicalProcedures.patientId,
        index: surgicalProcedures.index,
        type: surgicalProcedures.type,
        otherName: surgicalProcedures.otherName,
        eye: surgicalProcedures.eye,
        dateOfSurgery: surgicalProcedures.dateOfSurgery,
        surgeon: surgicalProcedures.surgeon,
        status: surgicalProcedures.status,
        remarks: surgicalProcedures.remarks,
        showInDischarge: surgicalProcedures.showInDischarge,
        details: surgicalProcedures.details,
        createdAt: surgicalProcedures.createdAt,
        encounterDate: clinicalEncounters.createdAt,
        patient: {
          mrn: patients.mrn,
          firstName: patients.firstName,
          lastName: patients.lastName,
        },
        doctor: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(surgicalProcedures)
      .innerJoin(clinicalEncounters, eq(surgicalProcedures.encounterId, clinicalEncounters.id))
      .innerJoin(patients, eq(surgicalProcedures.patientId, patients.id))
      .innerJoin(users, eq(surgicalProcedures.doctorUserId, users.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(surgicalProcedures.createdAt));

    return rows.map((r) => ({
      id: r.id,
      encounterId: r.encounterId,
      patientId: r.patientId,
      index: r.index,
      type: r.type,
      otherName: r.otherName,
      eye: r.eye,
      dateOfSurgery: r.dateOfSurgery,
      surgeon: r.surgeon,
      status: r.status,
      remarks: r.remarks,
      showInDischarge: r.showInDischarge,
      details: r.details,
      createdAt: r.createdAt,
      encounterDate: r.encounterDate,
      patientName: r.patient ? `${r.patient.firstName} ${r.patient.lastName}`.trim() : '',
      mrn: r.patient?.mrn ?? '',
      doctorName: r.doctor ? `${r.doctor.firstName} ${r.doctor.lastName}`.trim() : '',
    }));
  }
}
