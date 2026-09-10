import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, or, ilike, desc } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../../database/database.module';
import { patients } from '../../database/schema';
import { CreatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async create(dto: CreatePatientDto) {
    let newPatient: any;
    try {
      [newPatient] = await this.db
        .insert(patients)
        .values({
          mrn: dto.mrn,
          firstName: dto.firstName,
          lastName: dto.lastName,
          grandfatherName: dto.grandfatherName || null,
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
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException(`A patient with MRN "${dto.mrn}" already exists.`);
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

  async update(id: string, dto: Record<string, any>) {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length === 0) {
      return this.findById(id);
    }
    fields.updatedAt = new Date();
    const [updated] = await this.db
      .update(patients)
      .set(fields)
      .where(eq(patients.id, id))
      .returning();
    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return updated;
  }
}
