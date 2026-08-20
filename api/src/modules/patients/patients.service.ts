import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, or, ilike, desc, sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { patients } from '../../database/schema';
import { CreatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  private async generateNextMrn(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(patients);

    const nextSeq = (countResult[0]?.count || 0) + 1;
    return `SEL-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  }

  async create(dto: CreatePatientDto) {
    const mrn = await this.generateNextMrn();

    const [newPatient] = await this.db
      .insert(patients)
      .values({
        mrn,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dob: dto.dob ? dto.dob : null,
        gender: dto.gender || null,
        phone: dto.phone,
        email: dto.email || null,
        address: dto.address || null,
        occupation: dto.occupation || null,
        hobbies: dto.hobbies || null,
        isDiabetic: dto.isDiabetic ?? false,
        hasGlaucomaFamilyHistory: dto.hasGlaucomaFamilyHistory ?? false,
        priorEyeSurgery: dto.priorEyeSurgery || null,
      })
      .returning();

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
}
