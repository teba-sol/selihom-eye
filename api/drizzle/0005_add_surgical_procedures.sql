CREATE TYPE "public"."surgery_status" AS ENUM('PLANNED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "public"."surgical_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"appointment_id" uuid,
	"patient_id" uuid NOT NULL,
	"doctor_user_id" uuid NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"type" varchar(100) DEFAULT '' NOT NULL,
	"other_name" varchar(255) DEFAULT '',
	"eye" varchar(32) DEFAULT '',
	"date_of_surgery" varchar(50) DEFAULT '',
	"surgeon" varchar(255) DEFAULT '',
	"status" "public"."surgery_status" DEFAULT 'PLANNED' NOT NULL,
	"details" jsonb,
	"remarks" text,
	"show_in_discharge" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "public"."surgical_procedures" ADD CONSTRAINT "surgical_procedures_encounter_id_clinical_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."clinical_encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."surgical_procedures" ADD CONSTRAINT "surgical_procedures_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."surgical_procedures" ADD CONSTRAINT "surgical_procedures_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."surgical_procedures" ADD CONSTRAINT "surgical_procedures_doctor_user_id_users_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "surgical_procedures_encounter_id_index" ON "public"."surgical_procedures" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "surgical_procedures_patient_id_index" ON "public"."surgical_procedures" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "surgical_procedures_status_index" ON "public"."surgical_procedures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "surgical_procedures_date_of_surgery_index" ON "public"."surgical_procedures" USING btree ("date_of_surgery");
