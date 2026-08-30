import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { patientDocuments, patients, clinicalEncounters } from '../../database/schema';
import { CreatePatientDocumentDto } from './dto/patient-document.dto';

@Injectable()
export class PatientDocumentsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  private async ensurePatientExists(patientId: string) {
    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }
  }

  async list(patientId: string) {
    await this.ensurePatientExists(patientId);
    return this.db
      .select()
      .from(patientDocuments)
      .where(eq(patientDocuments.patientId, patientId))
      .orderBy(sql`${patientDocuments.documentDate} desc nulls last`, desc(patientDocuments.createdAt));
  }

  async create(patientId: string, recordedBy: string, dto: CreatePatientDocumentDto) {
    await this.ensurePatientExists(patientId);

    if (dto.encounterId) {
      const [encounter] = await this.db
        .select({ id: clinicalEncounters.id, patientId: clinicalEncounters.patientId })
        .from(clinicalEncounters)
        .where(eq(clinicalEncounters.id, dto.encounterId))
        .limit(1);
      if (!encounter) {
        throw new NotFoundException(`Encounter with ID ${dto.encounterId} not found`);
      }
      if (encounter.patientId !== patientId) {
        throw new BadRequestException('Encounter does not belong to this patient');
      }
    }

    const [inserted] = await this.db
      .insert(patientDocuments)
      .values({
        patientId,
        encounterId: dto.encounterId || null,
        documentType: dto.documentType,
        title: dto.title,
        documentDate: dto.documentDate || null,
        notes: dto.notes || null,
        recordedBy,
      })
      .returning();

    return inserted;
  }

  async delete(patientId: string, id: string) {
    await this.ensurePatientExists(patientId);
    const [deleted] = await this.db
      .delete(patientDocuments)
      .where(eq(patientDocuments.id, id))
      .returning();
    if (!deleted) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return { deleted: true };
  }
}