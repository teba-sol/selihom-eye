CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'CHECKED_IN', 'IN_EXAM', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."eye_laterality" AS ENUM('OD', 'OS', 'OU');--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('IOL', 'FRAME', 'LENS', 'MEDICATION', 'SURGICAL_CONSUMABLE');--> statement-breakpoint
CREATE TYPE "public"."referral_urgency" AS ENUM('EMERGENCY', 'URGENT', 'RAPID', 'ROUTINE');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('RECEIVED', 'SOFT_RESERVED', 'RELEASED', 'CONSUMED', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."surgical_status" AS ENUM('PRE_OP_PLANNED', 'SCHEDULED', 'INTRA_OP_CONFIRMED', 'CANCELLED', 'POST_OP_TRACKING');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('RECEPTIONIST', 'DOCTOR');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"queue_number" integer,
	"status" "appointment_status" DEFAULT 'CHECKED_IN' NOT NULL,
	"consent_obtained" boolean DEFAULT false NOT NULL,
	"consent_timestamp" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mrn" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"dob" date,
	"gender" varchar(20),
	"phone" varchar(50) NOT NULL,
	"email" varchar(100),
	"address" text,
	"occupation" varchar(100),
	"hobbies" text,
	"is_diabetic" boolean DEFAULT false NOT NULL,
	"has_glaucoma_family_history" boolean DEFAULT false NOT NULL,
	"prior_eye_surgery" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_mrn_unique" UNIQUE("mrn")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" "user_role" NOT NULL,
	"license_number" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clinical_encounters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_user_id" uuid NOT NULL,
	"chief_complaints" jsonb,
	"ocular_history" jsonb,
	"systemic_history" jsonb,
	"medications_and_compliance" text,
	"lifestyle_and_demands" text,
	"visual_acuity" jsonb,
	"binocular_vision" jsonb,
	"pupil_reflexes" jsonb,
	"slit_lamp_findings" jsonb,
	"posterior_segment" jsonb,
	"tonometry" jsonb,
	"tear_film_workup" jsonb,
	"biometry" jsonb,
	"diagnoses" jsonb,
	"treatment_plan_pathway" varchar(100),
	"counseling_advice_given" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"addendum_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinical_encounters_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "ocular_canvases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"segment_type" varchar(50) DEFAULT 'CORNEA_ANTERIOR' NOT NULL,
	"od_vector_data" jsonb,
	"os_vector_data" jsonb,
	"od_image_snapshot_url" text,
	"os_image_snapshot_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refraction_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"od_sph" numeric(4, 2),
	"od_cyl" numeric(4, 2),
	"od_axis" integer,
	"od_va" varchar(20),
	"od_add" numeric(4, 2),
	"os_sph" numeric(4, 2),
	"os_cyl" numeric(4, 2),
	"os_axis" integer,
	"os_va" varchar(20),
	"os_add" numeric(4, 2),
	"pd_binocular" numeric(4, 1),
	"pd_od" numeric(4, 1),
	"pd_os" numeric(4, 1),
	"bvd_mm" numeric(3, 1),
	"pinhole_va_od" varchar(20),
	"pinhole_va_os" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"prescribed_by_doctor_id" uuid NOT NULL,
	"medication_items" text NOT NULL,
	"special_instructions" text,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "optical_prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"prescribed_by_doctor_id" uuid NOT NULL,
	"od_sph" numeric(4, 2),
	"od_cyl" numeric(4, 2),
	"od_axis" integer,
	"od_add" numeric(4, 2),
	"os_sph" numeric(4, 2),
	"os_cyl" numeric(4, 2),
	"os_axis" integer,
	"os_add" numeric(4, 2),
	"lens_recommendation" varchar(100),
	"pd_mm" numeric(4, 1),
	"notes" text,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"referring_doctor_id" uuid NOT NULL,
	"target_specialist_name" varchar(255) NOT NULL,
	"target_specialty" varchar(100),
	"urgency" "referral_urgency" DEFAULT 'ROUTINE' NOT NULL,
	"clinical_notes" text NOT NULL,
	"pdf_summary_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid,
	"category" "item_category" NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100),
	"iol_model" varchar(100),
	"iol_power" numeric(4, 2),
	"on_hand_quantity" integer DEFAULT 0 NOT NULL,
	"soft_reserved_quantity" integer DEFAULT 0 NOT NULL,
	"reorder_threshold" integer DEFAULT 5 NOT NULL,
	"unit_cost" numeric(10, 2),
	"unit_price" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"surgical_case_id" uuid,
	"performed_by_user_id" uuid NOT NULL,
	"movement_type" "stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(100),
	"phone" varchar(50) NOT NULL,
	"email" varchar(100),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surgical_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_user_id" uuid NOT NULL,
	"operative_eye" "eye_laterality" NOT NULL,
	"planned_iol_item_id" uuid,
	"implanted_iol_item_id" uuid,
	"procedure_name" varchar(255) DEFAULT 'Phacoemulsification + IOL' NOT NULL,
	"scheduled_date" timestamp with time zone,
	"status" "surgical_status" DEFAULT 'PRE_OP_PLANNED' NOT NULL,
	"pre_op_risk_notes" text,
	"intra_op_technique_notes" text,
	"intra_op_complications" text,
	"day_1_follow_up_created" boolean DEFAULT false NOT NULL,
	"week_1_follow_up_created" boolean DEFAULT false NOT NULL,
	"month_1_follow_up_created" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_encounters" ADD CONSTRAINT "clinical_encounters_doctor_user_id_users_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocular_canvases" ADD CONSTRAINT "ocular_canvases_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refraction_records" ADD CONSTRAINT "refraction_records_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_prescriptions" ADD CONSTRAINT "medication_prescriptions_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_prescriptions" ADD CONSTRAINT "medication_prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_prescriptions" ADD CONSTRAINT "medication_prescriptions_prescribed_by_doctor_id_users_id_fk" FOREIGN KEY ("prescribed_by_doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optical_prescriptions" ADD CONSTRAINT "optical_prescriptions_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optical_prescriptions" ADD CONSTRAINT "optical_prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optical_prescriptions" ADD CONSTRAINT "optical_prescriptions_prescribed_by_doctor_id_users_id_fk" FOREIGN KEY ("prescribed_by_doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referring_doctor_id_users_id_fk" FOREIGN KEY ("referring_doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_surgical_case_id_surgical_cases_id_fk" FOREIGN KEY ("surgical_case_id") REFERENCES "public"."surgical_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgical_cases" ADD CONSTRAINT "surgical_cases_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgical_cases" ADD CONSTRAINT "surgical_cases_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgical_cases" ADD CONSTRAINT "surgical_cases_doctor_user_id_users_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgical_cases" ADD CONSTRAINT "surgical_cases_planned_iol_item_id_inventory_items_id_fk" FOREIGN KEY ("planned_iol_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgical_cases" ADD CONSTRAINT "surgical_cases_implanted_iol_item_id_inventory_items_id_fk" FOREIGN KEY ("implanted_iol_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;