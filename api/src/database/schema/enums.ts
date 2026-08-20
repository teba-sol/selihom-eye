import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'RECEPTIONIST',
  'DOCTOR',
]);

export const eyeLateralityEnum = pgEnum('eye_laterality', ['OD', 'OS', 'OU']);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'SCHEDULED',
  'CHECKED_IN',
  'IN_EXAM',
  'COMPLETED',
  'CANCELLED',
]);

export const itemCategoryEnum = pgEnum('item_category', [
  'IOL',
  'FRAME',
  'LENS',
  'MEDICATION',
  'SURGICAL_CONSUMABLE',
]);

export const surgicalStatusEnum = pgEnum('surgical_status', [
  'PRE_OP_PLANNED',
  'SCHEDULED',
  'INTRA_OP_CONFIRMED',
  'CANCELLED',
  'POST_OP_TRACKING',
]);

export const stockMovementTypeEnum = pgEnum('stock_movement_type', [
  'RECEIVED',
  'SOFT_RESERVED',
  'RELEASED',
  'CONSUMED',
  'ADJUSTMENT',
]);

export const referralUrgencyEnum = pgEnum('referral_urgency', [
  'EMERGENCY',
  'URGENT',
  'RAPID',
  'ROUTINE',
]);
