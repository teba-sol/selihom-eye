import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, desc, inArray, count, sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import {
  clinicalEncounters, refractionRecords, ocularCanvases,
  appointments, patients, users, surgicalProcedures,
} from '../../database/schema';
import { UpsertClinicalEncounterDto, AddendumDto,  } from './dto/clinical.dto';

function numStr(v: unknown): string | null {
  return v === undefined || v === null || v === '' ? null : String(v);
}

// ✅ RE-SCHEDULED removed
const SURGERY_STATUSES = new Set(['PLANNED', 'COMPLETED', 'CANCELLED']);
const PROTECTED_SURGERY_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

@Injectable()
export class ClinicalService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  // ─────────────────────────────────────────────────────────────
  // SURGERY SYNC (with protection rules)
  // ─────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────
  // SURGERY SYNC (with protection rules)
  // ─────────────────────────────────────────────────────────────
  private async syncSurgeries(
    tx: any,
    encounterId: string,
    doctorUserId: string,
    patientId: string,
    appointmentId: string | null,
    dto: UpsertClinicalEncounterDto
  ) {
    const aa: any = dto.sectionData?.['action-and-advice'] ?? {};
    let list: any[] = [];

    if (Array.isArray(aa.surgeries) && aa.surgeries.length > 0) {
      list = aa.surgeries;
    } else if (aa.surgeryType) {
      list = [{
        type: aa.surgeryType,
        otherName: aa.surgeryOther ?? '',
        remarks: aa.surgeryRemarks ?? '',
        status: aa.surgeryStatus ?? 'PLANNED',
        plannedOn: aa.surgeryPlannedOn ?? '',
        completedOn: aa.surgeryCompletedOn ?? '',
        outcome: aa.surgeryOutcome ?? '',
        cancelledReason: aa.surgeryCancelledReason ?? '',
        showInDischarge: aa.surgeryShowInDischarge ?? false,
        unifiedDetails: aa.unifiedDetails || null,
      }];
    }

    // ✅ Early return when no surgeries — skip unnecessary DELETE
    if (list.length === 0) return;

    // ✅ Fetch existing surgeries to enforce protection rules
    const existingSurgeries: any[] = await tx
      .select()
      .from(surgicalProcedures)
      .where(eq(surgicalProcedures.encounterId, encounterId));

    const existingById = new Map<string, any>(
      existingSurgeries.map((s: any) => [s.id as string, s])
    );

    // ✅ Check: are we trying to remove protected surgeries?
    const incomingIds = new Set<string>(
      list.map((s: any) => s?.id).filter(Boolean) as string[]
    );

    for (const existing of existingSurgeries) {
      if (PROTECTED_SURGERY_STATUSES.has(existing.status) && !incomingIds.has(existing.id)) {
        throw new BadRequestException(
          `Cannot delete ${String(existing.status).toLowerCase()} surgery "${existing.type}". ` +
          `Only PLANNED surgeries can be removed. Use addendum to update completed/cancelled surgeries.`
        );
      }
    }

    // ✅ Check: are we trying to EDIT a protected surgery?
    for (const incoming of list) {
      if (!incoming.id) continue;
      const existing = existingById.get(incoming.id as string);
      if (!existing) continue;

      if (PROTECTED_SURGERY_STATUSES.has(existing.status)) {
        const incomingStatus = String(incoming?.status ?? '').trim().toUpperCase();
        if (incomingStatus && incomingStatus !== existing.status) {
          throw new BadRequestException(
            `Cannot change status of ${String(existing.status).toLowerCase()} surgery "${existing.type}". ` +
            `Use addendum to record updates.`
          );
        }
      }
    }

    // ✅ Delete only non-protected (PLANNED) surgeries that are no longer in the list
    const toDelete = existingSurgeries.filter(
      (e: any) => !incomingIds.has(e.id) && e.status === 'PLANNED'
    );
    if (toDelete.length > 0) {
      await tx.delete(surgicalProcedures).where(
        inArray(surgicalProcedures.id, toDelete.map((s: any) => s.id as string))
      );
    }

    // ✅ Upsert incoming surgeries
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const type = String(s?.type ?? '').trim();
      const unified = s?.unifiedDetails || {};
      const eye = unified?.eyeToBeOperated ?? '';
      const dateOfSurgery = unified?.dateOfSurgery ?? '';
      const surgeon = unified?.surgeon ?? '';

      const status = SURGERY_STATUSES.has(String(s?.status ?? '').trim().toUpperCase())
        ? String(s.status).trim().toUpperCase()
        : 'PLANNED';

      const details = {
        type,
        otherName: s?.otherName ?? '',
        status,
        plannedOn: s?.plannedOn ?? '',
        completedOn: s?.completedOn ?? '',
        outcome: s?.outcome ?? '',
        cancelledReason: s?.cancelledReason ?? '',
        unifiedDetails: unified,
      };

      const existing: any = s.id ? existingById.get(s.id as string) : null;

      if (existing) {
        // Update — only allowed for PLANNED (protected already validated above)
        await tx
          .update(surgicalProcedures)
          .set({
            index: i,
            type,
            otherName: String(s?.otherName ?? '').trim() || null,
            eye: eye || null,
            dateOfSurgery: dateOfSurgery || null,
            surgeon: surgeon || null,
            status,
            remarks: s?.remarks ? String(s.remarks) : null,
            showInDischarge: s?.showInDischarge === true,
            details,
            updatedAt: new Date(),
          })
          .where(eq(surgicalProcedures.id, existing.id as string));
      } else {
        await tx.insert(surgicalProcedures).values({
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
          details,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HYDRATE (parallel)
  // ─────────────────────────────────────────────────────────────
  private async hydrate(encounterId: string) {
    const [encounter] = await this.db
      .select()
      .from(clinicalEncounters)
      .where(eq(clinicalEncounters.id, encounterId))
      .limit(1);

    if (!encounter) return null;

    // ✅ Parallel queries
    const [refractions, canvasArr, patientArr, surgeries] = await Promise.all([
      this.db.select().from(refractionRecords).where(eq(refractionRecords.encounterId, encounterId)),
      this.db.select().from(ocularCanvases).where(eq(ocularCanvases.encounterId, encounterId)).limit(1),
      this.db.select().from(patients).where(eq(patients.id, encounter.patientId)).limit(1),
      this.db.select().from(surgicalProcedures).where(eq(surgicalProcedures.encounterId, encounterId)).orderBy(surgicalProcedures.index),
    ]);

    const canvas = canvasArr[0] ?? null;
    const patient = patientArr[0] ?? null;

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
      surgeries,
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

  // ─────────────────────────────────────────────────────────────
  // UPSERT ENCOUNTER (with draft-blocking + fresh-start optimization)
  // ─────────────────────────────────────────────────────────────
  async upsertEncounter(doctorUserId: string, dto: UpsertClinicalEncounterDto) {
    const appointmentId = dto.appointmentId ?? null;
    let existing: any = null;
    let resumed = false;

    // 1. Look up by encounterId (explicit update)
    if (dto.encounterId) {
      const [byId] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.id, dto.encounterId))
        .limit(1);
      existing = byId ?? null;
    }
    // 2. Look up by appointmentId
    else if (appointmentId) {
      const [byApt] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.appointmentId, appointmentId))
        .limit(1);
      existing = byApt ?? null;
    }

    // 3. ✅ Draft detection for new exams — BLOCK if another draft exists
    if (!existing && !dto.encounterId && dto.patientId) {
      const [active] = await this.db
        .select()
        .from(clinicalEncounters)
        .where(and(
          eq(clinicalEncounters.patientId, dto.patientId),
          eq(clinicalEncounters.isLocked, false),
        ))
        .orderBy(desc(clinicalEncounters.createdAt))
        .limit(1);

      if (active) {
        // If appointmentId matches the draft, resume it
        if (appointmentId && active.appointmentId === appointmentId) {
          existing = active;
          resumed = true;
        } else {
          // ✅ Block: patient has an unfinished examination
          throw new ConflictException({
            message: 'This patient has an examination in progress. Please finalize or delete it before starting a new one.',
            code: 'DRAFT_EXISTS',
            draftEncounterId: active.id,
            draftCreatedAt: active.createdAt,
          });
        }
      }
    }

    // 4. Locked encounter — reject edits
    if (existing && existing.isLocked) {
      throw new BadRequestException(
        'Encounter is locked and finalized. Use addendum to record further clinical updates.'
      );
    }

    // 5. Validate appointment exists + belongs to the same patient
    if (appointmentId && !existing) {
      const [appointment] = await this.db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
      }

      // ✅ Patient / appointment consistency check
      if (appointment.patientId && dto.patientId && appointment.patientId !== dto.patientId) {
        throw new BadRequestException(
          'Appointment does not belong to the specified patient.'
        );
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

    let inserted = false;
    const result = await this.db.transaction(async (tx: any) => {
      let id = existing?.id;
      let row: any = null;

      if (existing) {
        const [updated] = await tx
          .update(clinicalEncounters)
          .set({
            doctorUserId,
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
            visualAcuity: dto.visualAcuity ?? existing.visualAcuity,
            binocularVision: dto.binocularVision ?? existing.binocularVision,
            pupilReflexes: dto.pupilReflexes ?? existing.pupilReflexes,
            slitLampFindings: dto.slitLampFindings ?? existing.slitLampFindings,
            posteriorSegment: dto.posteriorSegment ?? existing.posteriorSegment,
            tonometry: tonometryPayload ?? existing.tonometry,
            tearFilmWorkup: dto.tearFilmWorkup ?? existing.tearFilmWorkup,
            biometry: dto.biometry ?? existing.biometry,
            diagnoses: dto.diagnoses ?? existing.diagnoses,
            treatmentPlanPathway: dto.treatmentPlanPathway ?? existing.treatmentPlanPathway,
            counselingAdviceGiven: dto.counselingAdviceGiven ?? existing.counselingAdviceGiven,
            sectionData: dto.sectionData
              ? { ...(existing.sectionData ?? {}), ...dto.sectionData }
              : existing.sectionData,
            updatedAt: new Date(),
          })
          .where(eq(clinicalEncounters.id, existing.id))
          .returning();

        id = updated.id;
        row = updated;
      } else {
        const [insertedRow] = await tx
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

        id = insertedRow.id;
        row = insertedRow;
        inserted = true;

        if (appointmentId) {
          await tx
            .update(appointments)
            .set({ status: 'IN_EXAM', sourceEncounterId: insertedRow.id, updatedAt: new Date() })
            .where(eq(appointments.id, appointmentId));
        }
      }

      // Refractions
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

      // Canvas
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

      // Surgeries
      await this.syncSurgeries(tx, id, doctorUserId, dto.patientId, appointmentId, dto);

      return { id, row, inserted };
    });

    // ─────────────────────────────────────────────────────────────
    // RESPONSE SHAPING
    // ─────────────────────────────────────────────────────────────

    // ✅ FRESH EXAM: return blank workspace — no hydrate at all
    if (result.inserted) {
      const [patient] = await this.db
        .select()
        .from(patients)
        .where(eq(patients.id, dto.patientId))
        .limit(1);

      return {
        ...result.row,
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
        refractions: [],
        canvas: null,
        surgeries: [],
        resumed: false,
      };
    }

    // ✅ AUTOSAVE / EXPLICIT UPDATE: skip hydrate (response body is discarded).
    // Return a lean body — echoing section_data (which can be hundreds of KB)
    // back to the client wastes a large round trip for nothing.
    if (dto.encounterId && existing) {
      return {
        id: result.row.id,
        updatedAt: result.row.updatedAt,
        isLocked: result.row.isLocked,
        resumed: false,
        refractions: [],
        canvas: null,
        surgeries: [],
      };
    }

    // ✅ RESUME PATH: full hydrate so client can open the draft properly
    const hydrated = await this.hydrate(result.id);
    return hydrated ? { ...hydrated, resumed } : null;
  }

  // ─────────────────────────────────────────────────────────────
  // LOCK
  // ─────────────────────────────────────────────────────────────
  async lockEncounter(id: string) {
    return this.db.transaction(async (tx: any) => {
      const [locked] = await tx
        .update(clinicalEncounters)
        .set({ isLocked: true, lockedAt: new Date(), updatedAt: new Date() })
        .where(eq(clinicalEncounters.id, id))
        .returning();

      if (!locked) {
        throw new NotFoundException(`Encounter with ID ${id} not found`);
      }

      if (locked.appointmentId) {
        await tx
          .update(appointments)
          .set({ status: 'COMPLETED', sourceEncounterId: id, updatedAt: new Date() })
          .where(eq(appointments.id, locked.appointmentId));
      }

      return locked;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE ENCOUNTER
  // ─────────────────────────────────────────────────────────────
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
    await this.db.delete(surgicalProcedures).where(eq(surgicalProcedures.encounterId, id));
    await this.db.delete(clinicalEncounters).where(eq(clinicalEncounters.id, id));

    // Revert linked appointment back to SCHEDULED so the doctor can restart.
    if (encounter.appointmentId) {
      await this.db
        .update(appointments)
        .set({
          status: 'SCHEDULED',
          cancelledBy: null,
          cancelledAt: null,
          cancellationReason: null,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, encounter.appointmentId));
    }

    return { id };
  }

  // ─────────────────────────────────────────────────────────────
  // SURGERY ADDENDUM (for COMPLETED / CANCELLED only)
  // ─────────────────────────────────────────────────────────────
  // async addSurgeryAddendum(
  //   surgeryId: string,
  //   dto: SurgeryAddendumDto,
  //   author?: string,
  // ) {
  //   const [surgery] = await this.db
  //     .select()
  //     .from(surgicalProcedures)
  //     .where(eq(surgicalProcedures.id, surgeryId))
  //     .limit(1);

  //   if (!surgery) {
  //     throw new NotFoundException(`Surgery with ID ${surgeryId} not found`);
  //   }

  //   if (!PROTECTED_SURGERY_STATUSES.has(surgery.status)) {
  //     throw new BadRequestException(
  //       'Addendums are only allowed for COMPLETED or CANCELLED surgeries.'
  //     );
  //   }

  //   const timestamp = new Date().toISOString();
  //   const byLine = author ? ` by ${author}` : '';
  //   const entry = `[Addendum recorded${byLine} on ${timestamp}]:\n${dto.addendumNotes}`;
  //   const existing = surgery.addendumNotes ?? '';
  //   const combined = existing ? `${existing}\n\n${entry}` : entry;

  //   const [updated] = await this.db
  //     .update(surgicalProcedures)
  //     .set({ addendumNotes: combined, updatedAt: new Date() })
  //     .where(eq(surgicalProcedures.id, surgeryId))
  //     .returning();

  //   return updated;
  // }

  // ─────────────────────────────────────────────────────────────
  // COMPLETED COUNTS
  // ─────────────────────────────────────────────────────────────
  async getCompletedCountsByPatient(patientIds: string[]) {
    if (!patientIds.length) return [];

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

    return rows.map((r: any) => ({ patientId: r.patientId, count: r.count }));
  }

  // ─────────────────────────────────────────────────────────────
  // ENCOUNTER ADDENDUM
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // PATIENT HISTORY
  // ─────────────────────────────────────────────────────────────
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

    return rows.map((r: any) => ({
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

  // ─────────────────────────────────────────────────────────────
  // BILLING QUEUE
  // ─────────────────────────────────────────────────────────────
  async getBillingQueue() {
    const rows = await this.db
      .select({
        id: clinicalEncounters.id,
        patientId: clinicalEncounters.patientId,
        mrn: patients.mrn,
        firstName: patients.firstName,
        lastName: patients.lastName,
        billingPaidAt: clinicalEncounters.billingPaidAt,
        sectionData: clinicalEncounters.sectionData,
      })
      .from(clinicalEncounters)
      .innerJoin(patients, eq(clinicalEncounters.patientId, patients.id))
      .where(sql`(
        (${clinicalEncounters.sectionData}->'action-and-advice'->>'billing') IS NOT NULL
        OR (${clinicalEncounters.sectionData}->'action-and-advice'->>'medicationPricing') IS NOT NULL
        OR (${clinicalEncounters.sectionData}->'action-and-advice'->>'prescriptionPricing') IS NOT NULL
      )`)
      .orderBy(desc(clinicalEncounters.updatedAt));

    const entries: any[] = [];
    for (const r of rows) {
      const aa: any = (r.sectionData as any)?.['action-and-advice'] ?? {};
      const billing = aa.billing ?? null;
      const medicationPricing = aa.medicationPricing ?? null;
      const prescriptionPricing = aa.prescriptionPricing ?? null;
      const grandTotal =
        (billing?.total ?? 0) + (medicationPricing?.total ?? 0) + (prescriptionPricing?.total ?? 0);
      const confirmedAt =
        billing?.confirmedAt ?? medicationPricing?.confirmedAt ?? prescriptionPricing?.confirmedAt ?? '';
      entries.push({
        encounterId: r.id,
        patientId: r.patientId,
        patientName: `${r.firstName} ${r.lastName}`.trim(),
        mrn: r.mrn ?? '',
        billing,
        medicationPricing,
        prescriptionPricing,
        grandTotal,
        confirmedAt,
        billingPaidAt: r.billingPaidAt ?? null,
      });
    }
    return entries;
  }

  async markBillingPaid(encounterId: string) {
    const [updated] = await this.db
      .update(clinicalEncounters)
      .set({ billingPaidAt: new Date(), updatedAt: new Date() })
      .where(eq(clinicalEncounters.id, encounterId))
      .returning();
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // SURGERIES LIST
  // ─────────────────────────────────────────────────────────────
  async getSurgeries(filters: { status?: string; patientId?: string; from?: string; to?: string } = {}) {
    const conds: any[] = [];

    if (filters.status) conds.push(eq(surgicalProcedures.status, filters.status as any));
    if (filters.patientId) conds.push(eq(surgicalProcedures.patientId, filters.patientId));
    if (filters.from) conds.push(sql`${surgicalProcedures.createdAt} >= ${new Date(filters.from)}::timestamptz`);
    if (filters.to) conds.push(sql`${surgicalProcedures.createdAt} <= ${new Date(filters.to)}::timestamptz`);

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

    return rows.map((r: any) => ({
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