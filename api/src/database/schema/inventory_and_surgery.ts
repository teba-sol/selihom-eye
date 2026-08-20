import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { itemCategoryEnum, stockMovementTypeEnum, surgicalStatusEnum, eyeLateralityEnum } from './enums';
import { clinicalEncounters } from './clinical';
import { patients, users } from './core';

// 1. Suppliers
export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Inventory Catalog Items
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  category: itemCategoryEnum('category').notNull(), // IOL, FRAME, LENS, MEDICATION, SURGICAL_CONSUMABLE
  name: varchar('name', { length: 255 }).notNull(), // e.g. "AcrySof IQ SN60WF"
  sku: varchar('sku', { length: 100 }).unique(),

  // Specific IOL attributes
  iolModel: varchar('iol_model', { length: 100 }),
  iolPower: decimal('iol_power', { precision: 4, scale: 2 }), // e.g. +21.50 D

  // Live stock counts
  onHandQuantity: integer('on_hand_quantity').default(0).notNull(),
  softReservedQuantity: integer('soft_reserved_quantity').default(0).notNull(), // Reserved for upcoming surgeries
  reorderThreshold: integer('reorder_threshold').default(5).notNull(),

  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Surgical Cases (Biometry -> Soft Reserve -> Intra-Op Consumption)
export const surgicalCases = pgTable('surgical_cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  encounterId: uuid('encounter_id').references(() => clinicalEncounters.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  doctorUserId: uuid('doctor_user_id').references(() => users.id).notNull(),

  operativeEye: eyeLateralityEnum('operative_eye').notNull(), // OD or OS
  plannedIolItemId: uuid('planned_iol_item_id').references(() => inventoryItems.id),
  implantedIolItemId: uuid('implanted_iol_item_id').references(() => inventoryItems.id),

  procedureName: varchar('procedure_name', { length: 255 }).default('Phacoemulsification + IOL').notNull(),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  status: surgicalStatusEnum('status').default('PRE_OP_PLANNED').notNull(),

  // Pre-Op & Intra-Op Notes
  preOpRiskNotes: text('pre_op_risk_notes'),
  intraOpTechniqueNotes: text('intra_op_technique_notes'),
  intraOpComplications: text('intra_op_complications'),

  // Follow-up Sequence Generation Flags
  day1FollowUpCreated: boolean('day_1_follow_up_created').default(false).notNull(),
  week1FollowUpCreated: boolean('week_1_follow_up_created').default(false).notNull(),
  month1FollowUpCreated: boolean('month_1_follow_up_created').default(false).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Immutable Stock Movement Audit Trail
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').references(() => inventoryItems.id, { onDelete: 'cascade' }).notNull(),
  surgicalCaseId: uuid('surgical_case_id').references(() => surgicalCases.id),
  performedByUserId: uuid('performed_by_user_id').references(() => users.id).notNull(),

  movementType: stockMovementTypeEnum('movement_type').notNull(), // RECEIVED, SOFT_RESERVED, RELEASED, CONSUMED, ADJUSTMENT
  quantity: integer('quantity').notNull(),
  notes: text('notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
