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
          address: dto.address || null,
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
}
