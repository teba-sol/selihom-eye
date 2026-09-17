import { Injectable, Inject, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { eq, or, ilike, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { patients, clinicalEncounters, users } from '../../database/schema';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async create(dto: CreatePatientDto) {
    const mrn = dto.mrn.trim().toUpperCase();
    const [existing] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(ilike(patients.mrn, mrn))
      .limit(1);
    if (existing) {
      throw new ConflictException('Use another MRN, it is already held by an existing patient.');
    }

    let newPatient: any;
    try {
      [newPatient] = await this.db
        .insert(patients)
        .values({
          mrn,
          firstName: dto.firstName,
          lastName: dto.lastName,
          grandfatherName: dto.grandfatherName || null,
          dob: dto.dob ? dto.dob : null,
          gender: dto.gender || null,
          // The database currently stores phone as NOT NULL; an empty string
          // represents an intentionally omitted optional phone number.
          phone: dto.phone?.trim() || '',
          address: dto.address || null,
        })
        .returning();
    } catch (err: any) {
      const code = err?.code ?? err?.cause?.code;
      if (code === '23505') {
        throw new ConflictException('Use another MRN, it is already held by an existing patient.');
      }
      if (code === '53100') {
        throw new HttpException(
          'Database storage is full. A doctor must clear archived patient records before registering another patient.',
          HttpStatus.INSUFFICIENT_STORAGE,
        );
      }
      throw err;
    }

    return newPatient;
  }

  async search(query: string) {
    if (!query) {
      return this.db.select().from(patients).orderBy(desc(patients.createdAt)).limit(20);
    }
    return this.db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.mrn, `%${query}%`),
          ilike(patients.firstName, `%${query}%`),
          ilike(patients.lastName, `%${query}%`),
          ilike(patients.grandfatherName, `%${query}%`),
          ilike(patients.phone, `%${query}%`),
        ),
      )
      .limit(20);
  }

  async findById(id: string) {
    const [patient] = await this.db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    const [existing] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);
    if (!existing) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    try {
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (dto.firstName !== undefined) values.firstName = dto.firstName;
      if (dto.lastName !== undefined) values.lastName = dto.lastName;
      if (dto.grandfatherName !== undefined) values.grandfatherName = dto.grandfatherName || null;
      if (dto.dob !== undefined) values.dob = dto.dob ? dto.dob : null;
      if (dto.gender !== undefined) values.gender = dto.gender || null;
      if (dto.phone !== undefined) values.phone = dto.phone?.trim() || '';
      if (dto.address !== undefined) values.address = dto.address || null;

      const [updated] = await this.db
        .update(patients)
        .set(values)
        .where(eq(patients.id, id))
        .returning();
      return updated;
    } catch (err: any) {
      const code = err?.code ?? err?.cause?.code;
      if (code === '53100') {
        throw new HttpException(
          'Database storage is full. A doctor must clear archived patient records before editing patient information.',
          HttpStatus.INSUFFICIENT_STORAGE,
        );
      }
      throw err;
    }
  }

  async exportFinalizedRecords() {
    const [patientRows, encounters] = await Promise.all([
      this.db.select().from(patients).orderBy(desc(patients.createdAt)),
      this.db.select({
        patientId: clinicalEncounters.patientId,
        createdAt: clinicalEncounters.createdAt,
        diagnoses: clinicalEncounters.diagnoses,
        treatmentPlanPathway: clinicalEncounters.treatmentPlanPathway,
        counselingAdviceGiven: clinicalEncounters.counselingAdviceGiven,
        visualAcuity: clinicalEncounters.visualAcuity,
        tonometry: clinicalEncounters.tonometry,
        reasonForVisit: clinicalEncounters.reasonForVisit,
        symptomaticHistory: clinicalEncounters.symptomaticHistory,
        ocularHistory: clinicalEncounters.ocularHistory,
        systemicHistory: clinicalEncounters.systemicHistory,
        medicationHistory: clinicalEncounters.medicationHistory,
        familyOcularHistory: clinicalEncounters.familyOcularHistory,
        familySystemicHistory: clinicalEncounters.familySystemicHistory,
        spectaclesHistory: clinicalEncounters.spectaclesHistory,
        contactLensHistory: clinicalEncounters.contactLensHistory,
        lifestyleDemands: clinicalEncounters.lifestyleDemands,
        slitLampFindings: clinicalEncounters.slitLampFindings,
        posteriorSegment: clinicalEncounters.posteriorSegment,
        binocularVision: clinicalEncounters.binocularVision,
        sectionData: clinicalEncounters.sectionData,
        addendumNotes: clinicalEncounters.addendumNotes,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
      }).from(clinicalEncounters).innerJoin(users, eq(clinicalEncounters.doctorUserId, users.id)).where(eq(clinicalEncounters.isLocked, true)),
    ]);
    const byPatient = new Map<string, any[]>();
    for (const encounter of encounters) {
      const list = byPatient.get(encounter.patientId) ?? [];
      list.push(encounter);
      byPatient.set(encounter.patientId, list);
    }
    return patientRows.map((patient: any) => ({ ...patient, encounters: byPatient.get(patient.id) ?? [] }));
  }

  async purgePatientRecords() {
    const deleted = await this.db.transaction(async (tx: any) => {
      const rows = await tx.delete(patients).returning({ id: patients.id });
      return rows.length;
    });

    // All patient-linked tables use foreign keys with ON DELETE CASCADE. This
    // retains users while removing appointments, encounters, prescriptions,
    // optical orders, billing data, and related examination records.
    return { deletedPatients: deleted };
  }
}
